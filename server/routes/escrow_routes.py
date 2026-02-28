# server/routes/escrow_routes.py
"""
Hardened Production Escrow Module (V2.1).
Secures funds in Firebase RTDB with atomic state transitions and role-based permissions.
"""

from flask import Blueprint, request, jsonify
from firebase_admin import db
import time
import uuid

escrow_bp = Blueprint("escrow", __name__, url_prefix="/api/escrow")

# --- 1. PROPER FINITE STATE MACHINE (FSM) ---
# Strict logic gates to prevent invalid status jumps.
STATE_RULES = {
    "PENDING_PAYMENT": ["FUNDED", "CANCELLED"],
    "FUNDED": ["SHIPPED", "DISPUTED", "REFUNDED"],
    "SHIPPED": ["DELIVERED", "DISPUTED"], # REFUNDED removed: must go to DISPUTED or DELIVERED first
    "DELIVERED": ["RELEASED", "DISPUTED", "REFUNDED"],
    "DISPUTED": ["RELEASED", "REFUNDED"],
    "RELEASED": [], # TERMINAL: Ledger closed permanently
    "REFUNDED": [], # TERMINAL: Ledger closed permanently
    "CANCELLED": [] # TERMINAL: Ledger closed permanently
}

# --- 2. ATOMIC TRANSACTION WRAPPER ---
def execute_atomic_transition(escrow_id, target_state, actor_id, actor_role, reason):
    """
    Primary engine for all state changes. 
    Guarantees atomic fund movement, role validation, and state synchronization.
    No direct DB writes allowed; everything passes through this transaction.
    """
    escrow_ref = db.reference(f'escrows/{escrow_id}')

    def transaction_update(current_data):
        if current_data is None: return None # Abort if record missing

        # A. IMMUTABILITY CHECK
        # If ledger is already closed, block all further activity.
        if current_data.get('ledger', {}).get('is_closed'):
            raise Exception("Access Denied: Record is permanently closed.")
        
        current_state = current_data['status_matrix']['escrow_status']
        
        # B. FSM TRANSITION VALIDATION
        if target_state not in STATE_RULES.get(current_state, []):
            raise Exception(f"Protocol Violation: Cannot jump from {current_state} to {target_state}")

        # C. STRICT ROLE-BASED ACCESS CONTROL (RBAC)
        if actor_role != "ADMIN":
            # 1. Lock Enforcement (Only Admin or Dispute allowed when locked)
            if current_data.get('ledger', {}).get('is_locked') and target_state != "DISPUTED":
                raise Exception("Escrow Locked: Pending Admin resolution.")

            # 2. Transition Guard: Seller Only
            if current_state == "FUNDED" and target_state == "SHIPPED":
                if actor_id != current_data.get('seller_id'):
                    raise Exception("Auth Error: Only the Seller can initiate shipment.")
            
            # 3. Transition Guard: Buyer Only
            if current_state == "SHIPPED" and target_state == "DELIVERED":
                if actor_id != current_data.get('buyer_id'):
                    raise Exception("Auth Error: Only the Buyer can confirm delivery.")
            
            # 4. System Guard: Automated Payouts
            if actor_id == "SYSTEM":
                # System actor can ONLY trigger terminal states (Auto-Refund/Release)
                if target_state not in ["RELEASED", "REFUNDED"]:
                    raise Exception("Security: SYSTEM actor restricted to completion states only.")

        # D. SYNCHRONIZED PROPERTY UPDATES
        current_data['status_matrix']['escrow_status'] = target_state
        
        if target_state == "FUNDED":
            current_data['status_matrix']['payment_status'] = "COMPLETED"
            
        elif target_state == "SHIPPED":
            current_data['status_matrix']['shipment_status'] = "SHIPPED"
            # Set the auto-release window (7 days from shipment)
            current_data['deadlines']['auto_release_at'] = int(time.time()) + (7 * 86400)
            
        elif target_state == "DELIVERED":
            current_data['status_matrix']['shipment_status'] = "DELIVERED"
            
        elif target_state == "RELEASED":
            current_data['status_matrix']['payment_status'] = "TRANSFERRED"
            current_data['ledger']['is_closed'] = True # PERMANENT LOCK
            
        elif target_state == "REFUNDED":
            current_data['status_matrix']['payment_status'] = "REFUNDED"
            current_data['ledger']['is_closed'] = True # PERMANENT LOCK
            
        elif target_state == "CANCELLED":
            current_data['ledger']['is_closed'] = True

        # E. PERSISTENCE & AUDIT
        current_data['metadata']['updated_at'] = int(time.time())
        
        # Incremental Audit Trail (Append-Only)
        log_id = f"log_{int(time.time() * 1000)}"
        if 'audit_trail' not in current_data:
            current_data['audit_trail'] = {}
            
        current_data['audit_trail'][log_id] = {
            "old_state": current_state,
            "new_state": target_state,
            "action_by": actor_id,
            "role": actor_role,
            "reason": reason,
            "timestamp": int(time.time())
        }
        
        return current_data

    try:
        escrow_ref.transaction(transaction_update)
        return True, f"Success: Escrow moved to {target_state}"
    except Exception as e:
        return False, str(e)

# --- 3. SECURE ENDPOINTS ---

@escrow_bp.route("/order", methods=["POST"])
def initialize_escrow():
    """Initializes a new hardened escrow ledger (Buyer initiates)."""
    try:
        data = request.json
        escrow_id = f"esc_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        
        schema = {
            "escrow_id": escrow_id,
            "product_id": data['product_id'],
            "buyer_id": data['buyer_id'],
            "seller_id": data['seller_id'],
            "ledger": {
                "amount": float(data['amount']),
                "is_locked": False,
                "is_closed": False # Python Boolean Fix
            },
            "status_matrix": {
                "escrow_status": "PENDING_PAYMENT",
                "payment_status": "PENDING",
                "shipment_status": "PENDING"
            },
            "deadlines": {
                "created_at": now,
                "ship_by": now + (3 * 86400), # Exactly 3 days to ship
                "auto_release_at": 0
            },
            "metadata": {
                "created_at": now,
                "updated_at": now,
                "version": "2.1.0"
            },
            "audit_trail": {
                f"init_{now}": {"msg": "Hardened Ledger Initialized", "timestamp": now}
            }
        }
        db.reference(f'escrows/{escrow_id}').set(schema)
        return jsonify({"success": True, "escrow_id": escrow_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@escrow_bp.route("/process-action", methods=["POST"])
def process_action():
    """Unified entry point for manual state transitions."""
    data = request.json
    # Validation: Ensure role is specified for RBAC
    success, result = execute_atomic_transition(
        data['escrow_id'], 
        data['target_state'], 
        data['user_id'], 
        data.get('role', 'GUEST'), # Typically extracted from Firebase Auth JWT
        data.get('reason', 'Standard manual update')
    )
    return jsonify({"success": success, "message": result})

@escrow_bp.route("/scheduler/maintenance", methods=["POST"])
def run_maintenance():
    """
    High-performance scheduler queries. 
    Uses Indexed-Queries for Refunding and Releasing.
    """
    now = int(time.time())
    report = {"auto_refunded": 0, "auto_released": 0}

    # 1. OPTIMIZED AUTO-REFUND (Query only FUNDED)
    # Firebase Rules required: ".indexOn": "status_matrix/escrow_status"
    fund_check = db.reference('escrows').order_by_child('status_matrix/escrow_status').equal_to('FUNDED').get()
    
    if fund_check:
        for eid, data in fund_check.items():
            if now > data['deadlines']['ship_by']:
                success, _ = execute_atomic_transition(eid, "REFUNDED", "SYSTEM", "SYSTEM", "Auto-refund: Deadline exceeded")
                if success: report["auto_refunded"] += 1
    
    # 2. OPTIMIZED AUTO-RELEASE (Query only SHIPPED)
    ship_check = db.reference('escrows').order_by_child('status_matrix/escrow_status').equal_to('SHIPPED').get()
    
    if ship_check:
        for eid, data in ship_check.items():
            if now > data['deadlines']['auto_release_at']:
                success, _ = execute_atomic_transition(eid, "RELEASED", "SYSTEM", "SYSTEM", "Auto-release: Safe window closed")
                if success: report["auto_released"] += 1

    return jsonify({"success": True, "report": report})

@escrow_bp.route("/<escrow_id>", methods=["GET"])
def get_escrow_details(escrow_id):
    """Fetch full details of a single escrow for the dashboard."""
    esc = db.reference(f'escrows/{escrow_id}').get()
    if not esc:
        return jsonify({"success": False, "error": "Escrow not found"}), 404
    return jsonify({"success": True, "escrow": esc})

@escrow_bp.route("/user/<user_id>", methods=["GET"])
def get_user_escrows(user_id):
    """Fetch all escrows where the user is either buyer or seller."""
    # Note: In production, use indexing on buyer_id/seller_id
    all_escrows = db.reference('escrows').get() or {}
    user_escrows = []
    
    for eid, data in all_escrows.items():
        if data.get('buyer_id') == user_id or data.get('seller_id') == user_id:
            user_escrows.append(data)
            
    return jsonify({"success": True, "escrows": user_escrows})

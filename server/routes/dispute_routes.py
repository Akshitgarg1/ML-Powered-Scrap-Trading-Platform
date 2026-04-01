from flask import Blueprint, request, jsonify
from utils.firebase_db import DisputesAPI
import uuid

dispute_bp = Blueprint("dispute", __name__, url_prefix="/api/disputes")

@dispute_bp.route("/", methods=["POST"])
def open_dispute():
    """Open a new dispute against an escrow transaction."""
    data = request.json
    required = ["escrow_id", "raised_by_user_id", "reason_category", "description"]
    
    for req in required:
        if not data.get(req):
            return jsonify({"success": False, "error": f"Missing {req}"}), 400
            
    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"
    data['status'] = 'OPEN'
    
    success = DisputesAPI.open_dispute(dispute_id, data)
    
    if success:
        return jsonify({"success": True, "dispute_id": dispute_id}), 201
    return jsonify({"success": False, "error": "Failed to open dispute"}), 500

@dispute_bp.route("/escrow/<escrow_id>", methods=["GET"])
def get_disputes_for_escrow(escrow_id):
    """Retrieve all disputes linked to a specific escrow transaction."""
    disputes = DisputesAPI.get_by_escrow(escrow_id)
    return jsonify({"success": True, "disputes": disputes})

@dispute_bp.route("/<dispute_id>/resolve", methods=["POST"])
def resolve_dispute(dispute_id):
    """Admin function to resolve a dispute."""
    data = request.json
    resolution = data.get("admin_resolution", "Resolved by Admin")
    
    success = DisputesAPI.resolve_dispute(dispute_id, resolution)
    if success:
        return jsonify({"success": True, "message": "Dispute resolved"})
    return jsonify({"success": False, "error": "Failed to resolve"}), 500

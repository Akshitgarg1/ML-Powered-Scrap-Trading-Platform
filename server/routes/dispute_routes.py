from flask import Blueprint, request, jsonify
from firebase_admin import db
from utils.auth_helper import token_required
from utils.firebase_db import DisputesAPI, ProductsAPI
from routes.escrow_routes import execute_atomic_transition
import time
import uuid


dispute_bp = Blueprint("dispute", __name__, url_prefix="/api/disputes")


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for reliable notification delivery."""
    identity_keys = {str(user_id)}
    users = db.reference("users").get() or {}
    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue
        uid_str = str(uid)
        username = str(user_data.get("username", "")).strip()
        if uid_str == str(user_id) and username:
            identity_keys.add(username)
        if username and username == str(user_id):
            identity_keys.add(uid_str)
    return identity_keys


def _get_product_snapshot(product_id):
    """Get minimal product details for notifications."""
    try:
        product = ProductsAPI.get_by_id(product_id) or {}
    except Exception:
        product = {}

    title = product.get("title") or product.get("name") or "Item"

    image_url = None
    image_urls = product.get("image_urls") or product.get("imageUrls")
    if isinstance(image_urls, list) and image_urls:
        image_url = image_urls[0]
    if not image_url:
        image_url = product.get("image_url") or product.get("imageUrl")

    return {"title": title, "image_url": image_url, "product": product}


def _create_notification(target_user_id, notification):
    """Create notification for uid + username aliases."""
    recipients = _resolve_identity_keys(target_user_id)
    for recipient in recipients:
        notif = dict(notification)
        notif["user_id"] = recipient
        db.reference(f"notifications/{recipient}/{notification['notification_id']}").set(notif)


# -------------------------
# Legacy endpoints (kept for compatibility)
# -------------------------

@dispute_bp.route("/", methods=["POST"])
def open_dispute():
    """Open a new dispute against an escrow transaction (legacy, unauthenticated)."""
    data = request.json
    required = ["escrow_id", "raised_by_user_id", "reason_category", "description"]

    for req in required:
        if not data.get(req):
            return jsonify({"success": False, "error": f"Missing {req}"}), 400

    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"
    data["status"] = "OPEN"

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


# -------------------------
# New dispute workflow endpoints
# -------------------------

@dispute_bp.route("/report", methods=["POST"])
@token_required
def report_dispute(current_user):
    """Buyer reports a transaction to either CANCEL (pre-delivery) or RETURN (post-delivery)."""
    data = request.get_json(silent=True) or {}

    escrow_id = str(data.get("escrow_id") or "").strip()
    option = str(data.get("option") or "").strip().upper()
    reason = str(data.get("reason") or "").strip()[:2000]

    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400
    if option not in {"CANCEL", "RETURN"}:
        return jsonify({"success": False, "error": "option must be CANCEL or RETURN"}), 400
    if len(reason) < 3:
        return jsonify({"success": False, "error": "reason is required"}), 400

    escrow = db.reference(f"escrows/{escrow_id}").get() or {}
    if not escrow:
        return jsonify({"success": False, "error": "Escrow not found"}), 404

    buyer_id = str(escrow.get("buyer_id") or "")
    seller_id = str(escrow.get("seller_id") or "")
    if buyer_id != str(current_user.get("uid")):
        return jsonify({"success": False, "error": "Only the buyer can report this transaction"}), 403

    escrow_status = str((escrow.get("status_matrix") or {}).get("escrow_status") or "").upper()
    if option == "RETURN" and escrow_status != "DELIVERED":
        return jsonify({
            "success": False,
            "error": "RETURN is only available after delivery"
        }), 400
    if option == "CANCEL" and escrow_status not in {"FUNDED", "SHIPPED"}:
        return jsonify({
            "success": False,
            "error": "CANCEL is only available before delivery"
        }), 400

    product_id = str(escrow.get("product_id") or "")
    snapshot = _get_product_snapshot(product_id)
    now = int(time.time())

    # 1) Move escrow to DISPUTED and lock funds.
    ok, msg = execute_atomic_transition(
        escrow_id,
        "DISPUTED",
        current_user.get("uid"),
        "BUYER",
        f"Buyer reported {option}: {reason}",
        dispute_kind=option,
        dispute_reason=reason,
        return_required=(option == "RETURN"),
    )
    if not ok:
        return jsonify({"success": False, "error": msg or "Failed to open dispute"}), 400

    # 2) Create a dispute record.
    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"
    dispute_record = {
        "dispute_id": dispute_id,
        "escrow_id": escrow_id,
        "product_id": product_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "kind": option,
        "reason": reason,
        "status": "OPEN",
        "created_at": now,
        "refund_expected_by": now + 28 * 24 * 60 * 60,
        "product_title": snapshot.get("title"),
        "product_image_url": snapshot.get("image_url"),
    }
    DisputesAPI.open_dispute(dispute_id, dispute_record)

    # 3) Notify seller (include product name + image).
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    seller_notification = {
        "notification_id": notification_id,
        "user_id": seller_id,
        "type": "DISPUTE",
        "title": "Transaction Reported",
        "message": f"Buyer requested {option.lower()} for '{snapshot.get('title')}'. Reason: {reason}",
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": buyer_id,
        "action_required": option == "RETURN",
    }
    _create_notification(seller_id, seller_notification)

    # 4) Notify buyer.
    buyer_notif_id = f"notif_{uuid.uuid4().hex[:12]}"
    buyer_notification = {
        "notification_id": buyer_notif_id,
        "user_id": buyer_id,
        "type": "DISPUTE",
        "title": "Report Submitted",
        "message": f"Your {option.lower()} request was submitted. Refund processing may take up to 28 days.",
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": seller_id,
        "action_required": False,
    }
    _create_notification(buyer_id, buyer_notification)

    # 5) For CANCEL disputes, auto-initiate refund immediately.
    if option == "CANCEL":
        ok2, msg2 = execute_atomic_transition(
            escrow_id,
            "REFUNDED",
            "SYSTEM",
            "SYSTEM",
            "Auto-refund: Buyer cancelled before delivery",
            refund_reason="Buyer cancelled before delivery",
        )
        if ok2:
            db.reference(f"disputes/{dispute_id}").update({
                "status": "REFUND_INITIATED",
                "refund_initiated_at": now,
            })

    return jsonify({
        "success": True,
        "dispute_id": dispute_id,
        "escrow_id": escrow_id,
        "kind": option,
        "refund_expected_by": dispute_record["refund_expected_by"],
    }), 201


@dispute_bp.route("/confirm-return", methods=["POST"])
@token_required
def confirm_return(current_user):
    """Seller confirms item returned (RETURN disputes only)."""
    data = request.get_json(silent=True) or {}

    escrow_id = str(data.get("escrow_id") or "").strip()
    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400

    escrow = db.reference(f"escrows/{escrow_id}").get() or {}
    if not escrow:
        return jsonify({"success": False, "error": "Escrow not found"}), 404

    seller_id = str(escrow.get("seller_id") or "")
    if seller_id != str(current_user.get("uid")):
        return jsonify({"success": False, "error": "Only the seller can confirm return"}), 403

    escrow_status = str((escrow.get("status_matrix") or {}).get("escrow_status") or "").upper()
    dispute_meta = escrow.get("dispute") or {}
    kind = str(dispute_meta.get("kind") or "").upper()

    if escrow_status != "DISPUTED" or kind != "RETURN":
        return jsonify({"success": False, "error": "No active RETURN dispute for this escrow"}), 400

    if dispute_meta.get("return_confirmed") is True:
        return jsonify({"success": True, "message": "Return already confirmed"}), 200

    ok, msg = execute_atomic_transition(
        escrow_id,
        "REFUNDED",
        "SYSTEM",
        "SYSTEM",
        "Refund: Seller confirmed item returned",
        refund_reason="Seller confirmed item returned",
        return_confirmed=True,
    )

    if not ok:
        return jsonify({"success": False, "error": msg or "Failed to refund"}), 400

    now = int(time.time())

    # Notify buyer.
    product_id = str(escrow.get("product_id") or "")
    snapshot = _get_product_snapshot(product_id)
    buyer_id = str(escrow.get("buyer_id") or "")

    buyer_notif_id = f"notif_{uuid.uuid4().hex[:12]}"
    buyer_notification = {
        "notification_id": buyer_notif_id,
        "user_id": buyer_id,
        "type": "DISPUTE",
        "title": "Return Confirmed",
        "message": f"Seller confirmed return for '{snapshot.get('title')}'. Refund is being processed.",
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": seller_id,
        "action_required": False,
    }
    _create_notification(buyer_id, buyer_notification)

    return jsonify({"success": True, "message": "Return confirmed and refund initiated"}), 200

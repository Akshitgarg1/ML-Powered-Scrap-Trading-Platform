"""In-app messaging routes with escrow integration."""

import json
import os
import uuid
from datetime import datetime
from flask import Blueprint, jsonify, request

messaging_bp = Blueprint("messaging", __name__, url_prefix="/api/messaging")

MESSAGES_STORE = "messages_store.json"


def load_messages():
    """Load all message threads from storage."""
    if os.path.exists(MESSAGES_STORE):
        with open(MESSAGES_STORE, "r") as f:
            return json.load(f)
    return []


def save_messages(threads):
    """Save message threads to storage."""
    with open(MESSAGES_STORE, "w") as f:
        json.dump(threads, f, indent=2)


def get_or_create_thread(product_id, buyer_id, seller_id):
    """Get existing thread or create new one for buyer-seller conversation."""
    threads = load_messages()
    thread_id = f"{product_id}_{buyer_id}_{seller_id}"
    
    existing = next(
        (t for t in threads if t["thread_id"] == thread_id), None
    )
    
    if existing:
        return threads, existing
    
    new_thread = {
        "thread_id": thread_id,
        "product_id": product_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "messages": [],
        "status": "active",  # active, sold, closed
        "escrow_id": None,
    }
    threads.append(new_thread)
    save_messages(threads)
    return threads, new_thread


@messaging_bp.route("/threads", methods=["GET"])
def list_threads():
    """Get all message threads for a user (buyer or seller)."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    threads = load_messages()
    user_threads = [
        t for t in threads
        if t["buyer_id"] == user_id or t["seller_id"] == user_id
    ]
    
    # Sort by most recent message
    for thread in user_threads:
        if thread["messages"]:
            thread["last_message"] = thread["messages"][-1]
        else:
            thread["last_message"] = None
    
    user_threads.sort(
        key=lambda x: x["last_message"]["timestamp"] if x["last_message"] else x["created_at"],
        reverse=True
    )
    
    return jsonify({"success": True, "threads": user_threads}), 200


@messaging_bp.route("/thread/<thread_id>", methods=["GET"])
def get_thread(thread_id):
    """Get a specific message thread with all messages."""
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread", methods=["POST"])
def create_or_get_thread():
    """Create or retrieve a message thread for a product conversation."""
    data = request.get_json() or {}
    required = ["product_id", "buyer_id", "seller_id"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    
    threads, thread = get_or_create_thread(
        data["product_id"], data["buyer_id"], data["seller_id"]
    )
    
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread/<thread_id>/message", methods=["POST"])
def send_message(thread_id):
    """Send a message in a thread."""
    data = request.get_json() or {}
    required = ["sender_id", "content"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if data["sender_id"] not in [thread["buyer_id"], thread["seller_id"]]:
        return jsonify({"success": False, "error": "Unauthorized sender"}), 403
    
    message = {
        "id": str(uuid.uuid4()),
        "sender_id": data["sender_id"],
        "content": data["content"],
        "timestamp": datetime.utcnow().isoformat(),
        "read": False,
    }
    
    thread["messages"].append(message)
    thread["updated_at"] = datetime.utcnow().isoformat()
    save_messages(threads)
    
    return jsonify({"success": True, "message": message}), 201


@messaging_bp.route("/thread/<thread_id>/mark-read", methods=["POST"])
def mark_read(thread_id):
    """Mark all messages in a thread as read for a user."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    for msg in thread["messages"]:
        if msg["sender_id"] != user_id:
            msg["read"] = True
    
    save_messages(threads)
    return jsonify({"success": True}), 200


@messaging_bp.route("/thread/<thread_id>/link-escrow", methods=["POST"])
def link_escrow(thread_id):
    """Link an escrow session to a message thread."""
    data = request.get_json() or {}
    escrow_id = data.get("escrow_id")
    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400
    
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    thread["escrow_id"] = escrow_id
    thread["updated_at"] = datetime.utcnow().isoformat()
    save_messages(threads)
    
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread/<thread_id>/mark-sold", methods=["POST"])
def mark_sold(thread_id):
    """Mark product as sold and close the thread."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if thread["seller_id"] != user_id:
        return jsonify({"success": False, "error": "Only seller can mark as sold"}), 403
    
    thread["status"] = "sold"
    thread["updated_at"] = datetime.utcnow().isoformat()
    
    # Add system message
    system_msg = {
        "id": str(uuid.uuid4()),
        "sender_id": "system",
        "content": "✅ Product marked as sold. Transaction completed.",
        "timestamp": datetime.utcnow().isoformat(),
        "read": False,
        "is_system": True,
    }
    thread["messages"].append(system_msg)
    
    save_messages(threads)
    
    # Update product status in products.json
    from routes.product_routes import load_products, save_products
    products = load_products()
    product = next((p for p in products if p["id"] == thread["product_id"]), None)
    if product:
        product["status"] = "sold"
        product["sold_at"] = datetime.utcnow().isoformat()
        save_products(products)
    
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread/<thread_id>/close", methods=["POST"])
def close_thread(thread_id):
    """Close a thread without marking as sold."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    threads = load_messages()
    thread = next((t for t in threads if t["thread_id"] == thread_id), None)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if user_id not in [thread["buyer_id"], thread["seller_id"]]:
        return jsonify({"success": False, "error": "Unauthorized"}), 403
    
    thread["status"] = "closed"
    thread["updated_at"] = datetime.utcnow().isoformat()
    save_messages(threads)
    
    return jsonify({"success": True, "thread": thread}), 200


"""Escrow payment simulation routes providing safer transactions."""

import json
import os
import uuid
from datetime import datetime
from flask import Blueprint, jsonify, request

from routes.product_routes import load_products

escrow_bp = Blueprint("escrow", __name__, url_prefix="/api/escrow")

ESCROW_STORE = "escrow_store.json"


def load_escrows():
    if os.path.exists(ESCROW_STORE):
        with open(ESCROW_STORE, "r") as f:
            return json.load(f)
    return []


def save_escrows(items):
    with open(ESCROW_STORE, "w") as f:
        json.dump(items, f, indent=2)


def add_event(entry, action, actor):
    entry.setdefault("timeline", []).append(
        {
            "id": str(uuid.uuid4()),
            "action": action,
            "actor": actor,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


def mask_entry(entry):
    masked = entry.copy()
    masked["buyer_token"] = "provided_to_buyer"
    masked["seller_token"] = "provided_to_seller"
    return masked


@escrow_bp.route("/session", methods=["POST"])
def create_session():
    """Buyer initiates an escrow payment for a product."""
    data = request.get_json() or {}
    required = ["product_id", "buyer_id", "seller_id", "amount"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    product = next(
        (p for p in load_products() if p["id"] == data["product_id"]), None
    )
    if not product:
        return jsonify({"success": False, "error": "Product not found"}), 404

    escrows = load_escrows()
    escrow_entry = {
        "id": str(uuid.uuid4()),
        "product_id": product["id"],
        "product_title": product["title"],
        "buyer_id": data["buyer_id"],
        "seller_id": data["seller_id"],
        "amount": float(data["amount"]),
        "currency": data.get("currency", "INR"),
        "status": "AWAITING_SELLER",
        "buyer_token": uuid.uuid4().hex,
        "seller_token": uuid.uuid4().hex,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "timeline": [],
    }
    add_event(escrow_entry, "ESCROW_CREATED", "system")
    escrows.append(escrow_entry)
    save_escrows(escrows)

    return (
        jsonify(
            {
                "success": True,
                "escrow": {
                    **mask_entry(escrow_entry),
                    "buyer_token": escrow_entry["buyer_token"],
                    "seller_token": escrow_entry["seller_token"],
                },
            }
        ),
        201,
    )


def lookup_escrow(escrow_id):
    escrows = load_escrows()
    entry = next((e for e in escrows if e["id"] == escrow_id), None)
    return escrows, entry


@escrow_bp.route("/session/<escrow_id>/ship", methods=["POST"])
def confirm_shipment(escrow_id):
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        return jsonify({"success": False, "error": "Seller token required"}), 400

    escrows, entry = lookup_escrow(escrow_id)
    if not entry:
        return jsonify({"success": False, "error": "Escrow not found"}), 404
    if entry["seller_token"] != token:
        return jsonify({"success": False, "error": "Invalid seller token"}), 403
    if entry["status"] not in {"AWAITING_SELLER", "AWAITING_SHIPMENT"}:
        return jsonify({"success": False, "error": "Invalid status transition"}), 400

    entry["status"] = "AWAITING_BUYER_CONFIRMATION"
    entry["updated_at"] = datetime.utcnow().isoformat()
    add_event(entry, "SELLER_CONFIRMED_SHIPMENT", entry["seller_id"])
    save_escrows(escrows)
    return jsonify({"success": True, "escrow": mask_entry(entry)})


@escrow_bp.route("/session/<escrow_id>/release", methods=["POST"])
def release_funds(escrow_id):
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        return jsonify({"success": False, "error": "Buyer token required"}), 400

    escrows, entry = lookup_escrow(escrow_id)
    if not entry:
        return jsonify({"success": False, "error": "Escrow not found"}), 404
    if entry["buyer_token"] != token:
        return jsonify({"success": False, "error": "Invalid buyer token"}), 403
    if entry["status"] != "AWAITING_BUYER_CONFIRMATION":
        return jsonify({"success": False, "error": "Shipment not confirmed yet"}), 400

    entry["status"] = "COMPLETED"
    entry["updated_at"] = datetime.utcnow().isoformat()
    add_event(entry, "BUYER_RELEASED_FUNDS", entry["buyer_id"])
    save_escrows(escrows)
    return jsonify({"success": True, "escrow": mask_entry(entry)})


@escrow_bp.route("/session/<escrow_id>/dispute", methods=["POST"])
def dispute_session(escrow_id):
    data = request.get_json() or {}
    actor = data.get("actor")
    token = data.get("token")
    reason = data.get("reason", "No reason provided")
    if actor not in {"buyer", "seller"}:
        return jsonify({"success": False, "error": "Invalid actor"}), 400

    escrows, entry = lookup_escrow(escrow_id)
    if not entry:
        return jsonify({"success": False, "error": "Escrow not found"}), 404

    expected_token = entry["buyer_token"] if actor == "buyer" else entry["seller_token"]
    if expected_token != token:
        return jsonify({"success": False, "error": "Invalid token"}), 403

    entry["status"] = "UNDER_REVIEW"
    entry["updated_at"] = datetime.utcnow().isoformat()
    add_event(entry, f"{actor.upper()}_RAISED_DISPUTE::{reason}", actor)
    save_escrows(escrows)
    return jsonify({"success": True, "escrow": mask_entry(entry)})


@escrow_bp.route("/session/<escrow_id>", methods=["GET"])
def get_session(escrow_id):
    _, entry = lookup_escrow(escrow_id)
    if not entry:
        return jsonify({"success": False, "error": "Escrow not found"}), 404
    return jsonify({"success": True, "escrow": mask_entry(entry)})


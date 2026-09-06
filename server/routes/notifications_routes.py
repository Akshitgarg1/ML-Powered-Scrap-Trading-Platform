"""
Notifications Routes
Manages user notifications for transactions, purchases, and messages
"""

import time
import uuid
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Query
from fastapi.responses import JSONResponse
from firebase_admin import db

notifications_router = APIRouter(prefix="/api/notifications", tags=["notifications"])
notifications_bp = notifications_router  # Alias for backward compatibility


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for reliable notification delivery."""
    identity_keys = {str(user_id)}
    try:
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
    except Exception as e:
        print(f"Error resolving identity keys: {e}")
    return identity_keys


@notifications_router.get("/user/{user_id}")
async def get_user_notifications(
    user_id: str,
    limit: int = Query(50),
    read: Optional[str] = Query(None),
):
    """Get all notifications for a user with optional pagination"""
    try:
        notifications_ref = db.reference(f"notifications/{user_id}")
        notifications_data = notifications_ref.get() or {}

        notifications_list = list(notifications_data.values()) if notifications_data else []

        # Filter by read status if specified
        if read == "true":
            notifications_list = [n for n in notifications_list if n.get("read", False)]
        elif read == "false":
            notifications_list = [n for n in notifications_list if not n.get("read", False)]

        # Sort by created_at descending (newest first)
        notifications_list.sort(key=lambda x: x.get("created_at", 0), reverse=True)

        # Apply limit
        notifications_list = notifications_list[:limit]

        # Count unread
        unread_count = sum(1 for n in notifications_list if not n.get("read", False))

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "notifications": notifications_list,
                "unread_count": unread_count,
                "total": len(notifications_list),
            },
        )
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.get("/user/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    """Get count of unread notifications for a user"""
    try:
        notifications_ref = db.reference(f"notifications/{user_id}")
        notifications_data = notifications_ref.get() or {}

        unread_count = sum(1 for n in notifications_data.values() if not n.get("read", False))

        return JSONResponse(status_code=200, content={"success": True, "unread_count": unread_count})
    except Exception as e:
        print(f"Error getting unread count: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.post("/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: str,
    payload: Dict[str, Any] = Body(default_factory=dict),
):
    """Mark a single notification as read"""
    try:
        user_id = payload.get("user_id")

        if not user_id:
            return JSONResponse(status_code=400, content={"error": "user_id required"})

        notification_ref = db.reference(f"notifications/{user_id}/{notification_id}")
        notification_ref.update({"read": True})

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Notification marked as read"},
        )
    except Exception as e:
        print(f"Error marking notification as read: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.post("/user/{user_id}/mark-all-read")
async def mark_all_read(user_id: str):
    """Mark all notifications as read for a user"""
    try:
        notifications_ref = db.reference(f"notifications/{user_id}")
        notifications_data = notifications_ref.get() or {}

        updates = 0
        for notif_id, notif in notifications_data.items():
            if not notif.get("read", False):
                db.reference(f"notifications/{user_id}/{notif_id}").update({"read": True})
                updates += 1

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": f"Marked {updates} notifications as read"},
        )
    except Exception as e:
        print(f"Error marking all as read: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    user_id: Optional[str] = Query(None),
    payload: Optional[Dict[str, Any]] = Body(None),
):
    """Delete a specific notification"""
    try:
        uid = (payload or {}).get("user_id") or user_id

        if not uid:
            return JSONResponse(status_code=400, content={"error": "user_id required"})

        db.reference(f"notifications/{uid}/{notification_id}").delete()

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Notification deleted"},
        )
    except Exception as e:
        print(f"Error deleting notification: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.post("/user/{user_id}/clear")
async def clear_all_notifications(user_id: str):
    """Clear all notifications for a user"""
    try:
        db.reference(f"notifications/{user_id}").delete()
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "All notifications cleared"},
        )
    except Exception as e:
        print(f"Error clearing notifications: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@notifications_router.post("/transaction-start")
async def create_transaction_notification(payload: Dict[str, Any] = Body(default_factory=dict)):
    """Create notification when transaction starts"""
    try:
        seller_id = payload.get("seller_id")
        buyer_id = payload.get("buyer_id")
        product_name = payload.get("product_name")
        product_id = payload.get("product_id")

        if not all([seller_id, buyer_id, product_name]):
            return JSONResponse(status_code=400, content={"error": "Missing required fields"})

        # Create notification for seller (uid + username aliases)
        notification_id = f"notif_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        recipients = _resolve_identity_keys(seller_id)

        for recipient in recipients:
            notification = {
                "notification_id": notification_id,
                "user_id": recipient,
                "type": "PURCHASE",
                "title": "Purchase Initiated",
                "message": f"A buyer purchased '{product_name}'",
                "read": False,
                "created_at": now,
                "related_product_id": product_id,
                "related_user_id": buyer_id,
                "action_required": True,
            }
            db.reference(f"notifications/{recipient}/{notification_id}").set(notification)

        return JSONResponse(
            status_code=201,
            content={"success": True, "notification_id": notification_id},
        )
    except Exception as e:
        print(f"Error creating transaction notification: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


def create_notification(
    user_id,
    type,
    title,
    message,
    related_product_id=None,
    related_user_id=None,
):
    """Helper function to create notifications"""
    try:
        notification_id = f"notif_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        recipients = _resolve_identity_keys(user_id)

        for recipient in recipients:
            notification = {
                "notification_id": notification_id,
                "user_id": recipient,
                "type": type,
                "title": title,
                "message": message,
                "read": False,
                "created_at": now,
                "related_product_id": related_product_id,
                "related_user_id": related_user_id,
                "action_required": type in ["MESSAGE", "PURCHASE", "PRODUCT_INQUIRY"],
            }
            db.reference(f"notifications/{recipient}/{notification_id}").set(notification)
        return notification_id
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
        return None

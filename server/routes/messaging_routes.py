"""In-app messaging routes backed by Firebase RTDB."""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Query
from fastapi.responses import JSONResponse
from firebase_admin import db
from utils.firebase_db import MessagesAPI, ProductsAPI

messaging_router = APIRouter(prefix="/api/messaging", tags=["messaging"])
messaging_bp = messaging_router  # Alias for backward compatibility


def get_or_create_thread(product_id: str, buyer_id: str, seller_id: str):
    """Get existing thread or create new one for buyer-seller conversation."""
    thread_id = f"{product_id}_{buyer_id}_{seller_id}"
    
    existing = MessagesAPI.get_thread(thread_id)
    if existing:
        return existing
    
    new_thread = {
        "id": thread_id,
        "product_id": product_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "messages": {},
        "status": "active",  # active, sold, closed
    }
    
    MessagesAPI.create_thread(thread_id, new_thread)
    return new_thread


@messaging_router.get("/threads")
async def list_threads(user_id: Optional[str] = Query(None)):
    """Get all message threads for a user (buyer or seller)."""
    if not user_id:
        return JSONResponse(status_code=400, content={"success": False, "error": "user_id required"})
    
    user_threads = MessagesAPI.get_user_threads(user_id)
    
    # Sort by most recent message
    for thread in user_threads:
        messages = thread.get("messages", {})
        if messages and isinstance(messages, dict):
            # Sort messages to find the last one
            msg_list = list(messages.values())
            msg_list.sort(key=lambda x: x.get("timestamp", ""))
            thread["last_message"] = msg_list[-1] if msg_list else None
        elif messages and isinstance(messages, list):
            # Fallback if messages are stored as list
            thread["last_message"] = messages[-1] if messages else None
        else:
            thread["last_message"] = None
            
        # Standardize messages format for frontend
        if isinstance(messages, dict):
            thread["messages"] = list(messages.values())
            thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
    
    # Safely get timestamp or fallback to empty string and sort
    user_threads.sort(
        key=lambda x: (x.get("last_message") or {}).get("timestamp", x.get("created_at", "")),
        reverse=True
    )
    
    return JSONResponse(status_code=200, content={"success": True, "threads": user_threads})


@messaging_router.get("/thread/{thread_id}")
async def get_thread(thread_id: str):
    """Get a specific message thread with all messages."""
    thread = MessagesAPI.get_thread(thread_id)
    
    if not thread:
        return JSONResponse(status_code=404, content={"success": False, "error": "Thread not found"})
        
    messages = thread.get("messages", {})
    if isinstance(messages, dict):
        thread["messages"] = list(messages.values())
        thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
    
    return JSONResponse(status_code=200, content={"success": True, "thread": thread})


@messaging_router.post("/thread")
async def create_or_get_thread(payload: Dict[str, Any] = Body(default_factory=dict)):
    """Create or retrieve a message thread for a product conversation."""
    data = payload or {}
    required = ["product_id", "buyer_id", "seller_id"]
    for field in required:
        if not data.get(field):
            return JSONResponse(status_code=400, content={"success": False, "error": f"Missing {field}"})
    
    thread = get_or_create_thread(
        data["product_id"], data["buyer_id"], data["seller_id"]
    )
    
    # Ensure messages is a list format for UI
    messages = thread.get("messages", {})
    if isinstance(messages, dict):
        thread["messages"] = list(messages.values())
        thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
        
    return JSONResponse(status_code=200, content={"success": True, "thread": thread})


@messaging_router.post("/thread/{thread_id}/message")
async def send_message(thread_id: str, payload: Dict[str, Any] = Body(default_factory=dict)):
    """Send a message in a thread."""
    data = payload or {}
    required = ["sender_id", "content"]
    for field in required:
        if not data.get(field):
            return JSONResponse(status_code=400, content={"success": False, "error": f"Missing {field}"})
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return JSONResponse(status_code=404, content={"success": False, "error": "Thread not found"})
    
    if data["sender_id"] not in [thread.get("buyer_id"), thread.get("seller_id")]:
        return JSONResponse(status_code=403, content={"success": False, "error": "Unauthorized sender"})
    
    msg_id = str(uuid.uuid4())
    message = {
        "id": msg_id,
        "sender_id": data["sender_id"],
        "content": data["content"],
        "timestamp": datetime.utcnow().isoformat(),
        "read": False,
    }
    
    success = MessagesAPI.add_message(thread_id, msg_id, message)
    if success:
        try:
            receiver_id = thread.get("seller_id") if data["sender_id"] == thread.get("buyer_id") else thread.get("buyer_id")
            import time
            notification_id = f"notif_{str(uuid.uuid4())[:12]}"
            notif = {
                "notification_id": notification_id,
                "user_id": receiver_id,
                "type": "MESSAGE",
                "title": "New Message",
                "message": f"You have a new message: {data['content'][:50]}",
                "read": False,
                "created_at": int(time.time()),
                "related_product_id": thread.get("product_id"),
                "related_user_id": data["sender_id"],
                "action_required": False
            }
            db.reference(f'notifications/{receiver_id}/{notification_id}').set(notif)
            print(f"🔥 [DEBUG] Notification created: {notification_id} for user mode '{receiver_id}'")
        except Exception as e:
            print(f"[WARNING] Failed to generate message notification: {str(e)}")
            
        return JSONResponse(status_code=201, content={"success": True, "message": message})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to add message"})


@messaging_router.post("/thread/{thread_id}/mark-read")
async def mark_read(thread_id: str, payload: Dict[str, Any] = Body(default_factory=dict)):
    """Mark all messages in a thread as read for a user."""
    data = payload or {}
    user_id = data.get("user_id")
    if not user_id:
        return JSONResponse(status_code=400, content={"success": False, "error": "user_id required"})
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return JSONResponse(status_code=404, content={"success": False, "error": "Thread not found"})
        
    messages = thread.get("messages", {})
    if not messages:
        return JSONResponse(status_code=200, content={"success": True})
        
    try:
        if isinstance(messages, dict):
            for msg_id, msg in messages.items():
                if msg.get("sender_id") != user_id and not msg.get("read"):
                    db.reference(f'messages/{thread_id}/messages/{msg_id}/read').set(True)
        return JSONResponse(status_code=200, content={"success": True})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@messaging_router.post("/thread/{thread_id}/mark-sold")
async def mark_sold(thread_id: str, payload: Dict[str, Any] = Body(default_factory=dict)):
    """Mark product as sold and close the thread."""
    data = payload or {}
    user_id = data.get("user_id")
    if not user_id:
        return JSONResponse(status_code=400, content={"success": False, "error": "user_id required"})
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return JSONResponse(status_code=404, content={"success": False, "error": "Thread not found"})
    
    if thread.get("seller_id") != user_id:
        return JSONResponse(status_code=403, content={"success": False, "error": "Only seller can mark as sold"})
        
    try:
        timestamp = datetime.utcnow().isoformat()
        db.reference(f'messages/{thread_id}/status').set("sold")
        db.reference(f'messages/{thread_id}/updated_at').set(timestamp)
        
        # Add system message
        msg_id = str(uuid.uuid4())
        system_msg = {
            "id": msg_id,
            "sender_id": "system",
            "content": "✅ Product marked as sold. Transaction completed.",
            "timestamp": timestamp,
            "read": False,
            "is_system": True,
        }
        MessagesAPI.add_message(thread_id, msg_id, system_msg)
        
        # Update product status 
        product_id = thread.get("product_id")
        if product_id:
            ProductsAPI.update(product_id, {
                "status": "sold",
                "sold_at": timestamp
            })
            
        thread["status"] = "sold"
        return JSONResponse(status_code=200, content={"success": True, "thread": thread})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@messaging_router.post("/thread/{thread_id}/close")
async def close_thread(thread_id: str, payload: Dict[str, Any] = Body(default_factory=dict)):
    """Close a thread without marking as sold."""
    data = payload or {}
    user_id = data.get("user_id")
    if not user_id:
        return JSONResponse(status_code=400, content={"success": False, "error": "user_id required"})
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return JSONResponse(status_code=404, content={"success": False, "error": "Thread not found"})
    
    if user_id not in [thread.get("buyer_id"), thread.get("seller_id")]:
        return JSONResponse(status_code=403, content={"success": False, "error": "Unauthorized"})
        
    try:
        db.reference(f'messages/{thread_id}/status').set("closed")
        db.reference(f'messages/{thread_id}/updated_at').set(datetime.utcnow().isoformat())
        thread["status"] = "closed"
        return JSONResponse(status_code=200, content={"success": True, "thread": thread})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

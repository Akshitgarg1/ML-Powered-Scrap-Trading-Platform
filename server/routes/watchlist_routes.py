from typing import Any, Dict, Optional
from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from utils.firebase_db import WatchlistAPI

watchlist_router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])
watchlist_bp = watchlist_router  # Alias for backward compatibility


@watchlist_router.get("/{user_id}")
async def get_watchlist(user_id: str):
    """Retrieve all products in a user's watchlist."""
    items = WatchlistAPI.get_user_watchlist(user_id)
    return JSONResponse(status_code=200, content={"success": True, "watchlist": items})


@watchlist_router.post("")
@watchlist_router.post("/")
async def add_to_watchlist(payload: Optional[Dict[str, Any]] = Body(None)):
    """Add a product to the user's watchlist."""
    data = payload or {}
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    try:
        target_price = float(data.get("target_price", 0.0))
    except (ValueError, TypeError):
        target_price = 0.0

    if not user_id or not product_id:
        return JSONResponse(status_code=400, content={"success": False, "error": "Missing user_id or product_id"})

    success = WatchlistAPI.add_to_watchlist(user_id, product_id, target_price)
    if success:
        return JSONResponse(status_code=201, content={"success": True, "message": "Added to watchlist"})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to add to watchlist"})


@watchlist_router.delete("/{user_id}/{product_id}")
async def remove_from_watchlist(user_id: str, product_id: str):
    """Remove a product from the user's watchlist."""
    success = WatchlistAPI.remove_from_watchlist(user_id, product_id)
    if success:
        return JSONResponse(status_code=200, content={"success": True, "message": "Removed from watchlist"})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to remove"})

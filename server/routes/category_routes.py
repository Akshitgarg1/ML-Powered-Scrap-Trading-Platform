from typing import Any, Dict, Optional
import uuid
from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from utils.firebase_db import CategoriesAPI

category_router = APIRouter(prefix="/api/categories", tags=["categories"])
category_bp = category_router  # Alias for backward compatibility


@category_router.get("")
@category_router.get("/")
async def get_categories():
    """Retrieve all standard second-hand product categories and average values."""
    categories = CategoriesAPI.get_all()
    return JSONResponse(status_code=200, content={"success": True, "categories": categories})


@category_router.post("")
@category_router.post("/")
async def add_category(payload: Optional[Dict[str, Any]] = Body(None)):
    """Add a new standardized product category for the second-hand market."""
    data = payload or {}
    required = ["name", "average_market_value"]

    for req in required:
        if req not in data:
            return JSONResponse(status_code=400, content={"success": False, "error": f"Missing {req}"})

    category_id = f"cat_{uuid.uuid4().hex[:8]}"

    success = CategoriesAPI.add_category(category_id, data)
    if success:
        return JSONResponse(status_code=201, content={"success": True, "category_id": category_id})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to add category"})


@category_router.put("/{category_id}/price")
async def update_price(category_id: str, payload: Optional[Dict[str, Any]] = Body(None)):
    """Update the average market value for a category based on trends."""
    data = payload or {}
    try:
        new_price = float(data.get("average_market_value", 0))
    except (ValueError, TypeError):
        new_price = 0

    if new_price <= 0:
        return JSONResponse(status_code=400, content={"success": False, "error": "Invalid price"})

    success = CategoriesAPI.update_price(category_id, new_price)
    if success:
        return JSONResponse(status_code=200, content={"success": True, "message": "Market value updated successfully"})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to update"})

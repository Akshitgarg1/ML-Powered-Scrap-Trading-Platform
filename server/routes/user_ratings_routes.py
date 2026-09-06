from typing import Any, Dict, Optional
import uuid
from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from utils.firebase_db import UserRatingsAPI

ratings_router = APIRouter(prefix="/api/ratings", tags=["ratings"])
ratings_bp = ratings_router  # Alias for backward compatibility


@ratings_router.post("")
@ratings_router.post("/")
async def submit_rating(payload: Optional[Dict[str, Any]] = Body(None)):
    """Submit a peer-to-peer rating for a completed transaction."""
    data = payload or {}

    if not all(k in data for k in ("reviewer_id", "reviewee_id", "rating")):
        return JSONResponse(status_code=400, content={"success": False, "error": "Missing required fields"})

    try:
        data["rating"] = float(data["rating"])
        if data["rating"] < 1 or data["rating"] > 5:
            return JSONResponse(status_code=400, content={"success": False, "error": "Rating must be between 1 and 5"})
    except (ValueError, TypeError):
        return JSONResponse(status_code=400, content={"success": False, "error": "Invalid rating format"})

    rating_id = f"rate_{uuid.uuid4().hex[:12]}"
    success = UserRatingsAPI.add_rating(rating_id, data)

    if success:
        return JSONResponse(status_code=201, content={"success": True, "rating_id": rating_id})
    return JSONResponse(status_code=500, content={"success": False, "error": "Failed to submit rating"})


@ratings_router.get("/user/{user_id}/score")
async def get_trust_score(user_id: str):
    """Get the aggregate trust score and reviews for a user."""
    score = UserRatingsAPI.get_trust_score(user_id)
    ratings = UserRatingsAPI.get_user_ratings(user_id)

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "trust_score": round(score, 1),
            "total_reviews": len(ratings) if ratings else 0,
            "ratings": ratings,
        },
    )

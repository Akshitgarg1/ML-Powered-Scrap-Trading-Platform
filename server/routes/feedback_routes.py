from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from fastapi import APIRouter, Body, Query
from fastapi.responses import JSONResponse
from utils.firebase_db import FeedbackAPI, ProductsAPI

feedback_router = APIRouter(prefix="/api/feedback", tags=["feedback"])
feedback_bp = feedback_router  # Alias for backward compatibility

# ==========================================
# Product-Specific Feedback Routes
# ==========================================


@feedback_router.post("/product")
async def submit_product_feedback(payload: Optional[Dict[str, Any]] = Body(None)):
    """
    Submit feedback for a specific product.
    Validates input and stores the feedback in the Firebase Realtime Database.
    """
    try:
        data = payload or {}
        if not data:
            return JSONResponse(status_code=400, content={"success": False, "error": "No data provided"})

        # Extract and validate required fields
        product_id = data.get("product_id")
        rating = data.get("rating")
        comment = str(data.get("comment", "")).strip()
        user_name = str(data.get("user_name", "")).strip()

        if not product_id:
            return JSONResponse(status_code=400, content={"success": False, "error": "product_id is required"})

        # Ensure rating is between 1 and 5; default to 5 if invalid
        try:
            rating = int(rating)
            rating = max(1, min(5, rating))
        except (ValueError, TypeError):
            rating = 5

        # Validate comment length constraints
        if len(comment) < 3:
            return JSONResponse(status_code=400, content={"success": False, "error": "Comment too short (min 3 chars)"})
        if len(comment) > 2000:
            comment = comment[:2000]  # Trim excessive input

        # Require a logged-in user to submit feedback so review ownership can be enforced
        reviewer_id = str(data.get("user_id", "")).strip()
        if not reviewer_id:
            return JSONResponse(status_code=401, content={"success": False, "error": "user_id is required to submit feedback"})

        # Assign default user name if missing
        if not user_name:
            user_name = "Anonymous"

        # Ensure product exists and prevent the uploader from reviewing their own listing
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return JSONResponse(status_code=404, content={"success": False, "error": "Product not found"})

        if reviewer_id == str(product.get("user_id", "")) or reviewer_id == str(product.get("seller_id", "")):
            return JSONResponse(status_code=403, content={"success": False, "error": "You cannot review your own product"})

        # Prevent duplicate submissions from the same user for the same product
        existing_feedback = FeedbackAPI.get_product_feedback(product_id)
        if any(str(f.get("user_id", "")) == reviewer_id for f in existing_feedback):
            return JSONResponse(status_code=400, content={"success": False, "error": "You have already submitted feedback for this product"})

        # Construct feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "product_id": str(product_id),
            "user_id": reviewer_id,
            "rating": rating,
            "comment": comment,
            "user_name": user_name,
            "timestamp": datetime.now().isoformat(),
        }

        # Save to Firebase Realtime Database using the dedicated API
        success = FeedbackAPI.add_product_feedback(feedback_id, feedback)

        if success:
            return JSONResponse(status_code=201, content={"success": True, "feedback_id": feedback_id})
        else:
            return JSONResponse(status_code=500, content={"success": False, "error": "Failed to save feedback to database"})

    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})


@feedback_router.delete("/product/{feedback_id}")
async def delete_product_feedback(
    feedback_id: str,
    user_id: Optional[str] = Query(None),
    payload: Optional[Dict[str, Any]] = Body(None),
):
    """Delete product feedback if requested by the same reviewer."""
    try:
        data = payload or {}
        uid = str(data.get("user_id", "") or user_id or "").strip()
        if not uid:
            return JSONResponse(status_code=401, content={"success": False, "error": "user_id is required"})

        feedback = FeedbackAPI.get_product_feedback_by_id(feedback_id)
        if not feedback:
            return JSONResponse(status_code=404, content={"success": False, "error": "Feedback not found"})

        if str(feedback.get("user_id", "")) != uid:
            return JSONResponse(status_code=403, content={"success": False, "error": "You can only delete your own feedback"})

        success = FeedbackAPI.delete_product_feedback(feedback_id)
        if success:
            return JSONResponse(status_code=200, content={"success": True})
        return JSONResponse(status_code=500, content={"success": False, "error": "Failed to delete feedback"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})


@feedback_router.get("/product/{product_id}")
async def get_product_feedback(product_id: str):
    """
    Get all feedback associated with a specific product ID.
    Calculates the average rating across all retrieved product feedback.
    """
    try:
        # Retrieve all feedback for the product via Firebase
        product_feedback = FeedbackAPI.get_product_feedback(product_id)

        if not product_feedback:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "feedback": [],
                    "average_rating": 0,
                    "total_reviews": 0,
                },
            )

        # Calculate the average product rating
        avg_rating = sum(int(f.get("rating", 0)) for f in product_feedback) / len(product_feedback)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "feedback": product_feedback,
                "average_rating": round(avg_rating, 1),
                "total_reviews": len(product_feedback),
            },
        )
    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})


# ==========================================
# General Platform Feedback Routes
# ==========================================


@feedback_router.post("/general")
async def submit_general_feedback(payload: Optional[Dict[str, Any]] = Body(None)):
    """
    Submit general platform feedback, feature requests, or suggestions.
    Stores the generalized feedback into Firebase Realtime Database.
    """
    try:
        data = payload or {}
        if not data:
            return JSONResponse(status_code=400, content={"success": False, "error": "No data provided"})

        # Extract fields
        msg = str(data.get("message", "")).strip()
        f_type = str(data.get("type", "suggestion")).lower()
        email = str(data.get("user_email", "")).strip()

        if not msg:
            return JSONResponse(status_code=400, content={"success": False, "error": "Message is required"})

        # Construct general feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "type": f_type,
            "message": msg[:2000],  # Cap message size
            "user_email": email,
            "timestamp": datetime.now().isoformat(),
        }

        # Save to Firebase Realtime Database
        success = FeedbackAPI.add_general_feedback(feedback_id, feedback)

        if success:
            return JSONResponse(status_code=201, content={"success": True, "feedback_id": feedback_id})
        else:
            return JSONResponse(status_code=500, content={"success": False, "error": "Failed to save feedback to database"})

    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})


@feedback_router.get("/general")
async def get_general_feedback():
    """
    Retrieve all general platform feedback from the database.
    """
    try:
        general_feedback = FeedbackAPI.get_general_feedback()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "feedback": general_feedback,
            },
        )
    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})

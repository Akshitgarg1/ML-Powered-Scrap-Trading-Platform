import os
import jwt
from typing import Optional
from fastapi import Header, HTTPException, Depends
from firebase_admin import db


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """FastAPI dependency to extract and validate the JWT from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={"message": "Authentication token is missing!", "success": False},
        )

    token = authorization.split(" ")[1] if "Bearer" in authorization else authorization
    secret_key = os.getenv("SECRET_KEY", "your-secret-key")

    try:
        data = jwt.decode(token, secret_key, algorithms=["HS256"])
        user_id = data.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail={"message": "Invalid authentication token: missing user_id", "success": False},
            )
        user_ref = db.reference(f"users/{user_id}")
        current_user = user_ref.get()
        if not current_user:
            raise HTTPException(
                status_code=401,
                detail={"message": "Invalid authentication token! User not found.", "success": False},
            )
        current_user["uid"] = user_id
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail={"message": f"Invalid authentication token: {str(e)}", "success": False},
        )


def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Optional authentication dependency; returns None if not authenticated."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except Exception:
        return None

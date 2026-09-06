# server/routes/auth_routes.py
"""
Authentication Routes for FastAPI

Handles:
- User registration
- User login
- Profile retrieval
- Profile update
"""

import os
import re
import uuid
import datetime
import bcrypt
import jwt
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from firebase_admin import db

from utils.auth_helper import get_current_user

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PHONE_REGEX = re.compile(r"^[6-9][0-9]{9}$")


def normalize_input(value: str) -> str:
    """Normalize user input for consistent comparison."""
    return str(value or "").lower().strip()


def is_valid_email(email: str) -> bool:
    """Validate email format."""
    return bool(EMAIL_REGEX.match(str(email or "").strip()))


def is_valid_phone(phone: str) -> bool:
    """Validate Indian 10-digit mobile number."""
    trimmed = str(phone or "").strip()
    return bool(trimmed and PHONE_REGEX.match(trimmed))


def user_exists(username: str, email: str) -> bool:
    """Check if username or email already exists."""
    users_ref = db.reference("users")
    users = users_ref.get()

    if not isinstance(users, dict):
        return False

    username_clean = normalize_input(username)
    email_clean = normalize_input(email)

    for uid, user in users.items():
        if not isinstance(user, dict):
            continue
        if normalize_input(user.get("username", "")) == username_clean:
            return True
        if normalize_input(user.get("email", "")) == email_clean:
            return True

    return False


def generate_token(user_id: str) -> str:
    """Generate JWT token for authentication."""
    secret_key = os.getenv("SECRET_KEY", "your-secret-key")
    token = jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        },
        secret_key,
        algorithm="HS256",
    )
    return token


# =====================================================
# Routes
# =====================================================

@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: Dict[str, Any] = Body(...)):
    """Register a new user."""
    username = payload.get("username")
    email = payload.get("email")
    password = payload.get("password")

    full_name = payload.get("full_name", "")
    phone = payload.get("phone", "")

    if not username or not email or not password:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Required fields missing!"},
        )

    email = str(email).strip()
    phone = str(phone).strip()
    username_clean = normalize_input(username)
    email_clean = normalize_input(email)

    if not is_valid_email(email):
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Enter a valid email address."},
        )

    if len(str(password)) < 6:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Password must be at least 6 characters."},
        )

    if phone and not is_valid_phone(phone):
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Enter a valid 10-digit Indian phone number."},
        )

    # Check existing user
    if user_exists(username_clean, email_clean):
        return JSONResponse(
            status_code=409,
            content={"success": False, "message": "Username or email already registered!"},
        )

    # Password hashing
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(str(password).encode("utf-8"), salt).decode("utf-8")

    uid = str(uuid.uuid4())

    new_user = {
        "username": username_clean,
        "email": email_clean,
        "password": hashed_pw,
        "full_name": full_name,
        "phone": phone,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        "profilePic": f"https://ui-avatars.com/api/?name={username_clean}&background=random",
        "bio": "New member of the TradeSmart community.",
    }

    db.reference(f"users/{uid}").set(new_user)

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Registration successful!",
            "uid": uid,
        },
    )


@auth_router.post("/login")
async def login(payload: Dict[str, Any] = Body(...)):
    """Authenticate user and return JWT token."""
    identifier = normalize_input(payload.get("identifier", ""))
    password = payload.get("password")

    if not identifier or not password:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Enter username/email and password!"},
        )

    users = db.reference("users").get()

    if not isinstance(users, dict):
        users = {}

    target_uid = None
    target_user = None

    for uid, user in users.items():
        if not isinstance(user, dict):
            continue
        if (
            normalize_input(user.get("username", "")) == identifier
            or normalize_input(user.get("email", "")) == identifier
        ):
            target_uid = uid
            target_user = user
            break

    if not target_user or "password" not in target_user:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Incorrect credentials!"},
        )

    # Password check
    try:
        if not bcrypt.checkpw(
            str(password).encode("utf-8"),
            str(target_user["password"]).encode("utf-8"),
        ):
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Incorrect credentials!"},
            )
    except Exception:
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Incorrect credentials!"},
        )

    token = generate_token(target_uid)

    # Remove password before returning
    public_user = target_user.copy()
    public_user.pop("password", None)
    public_user["uid"] = target_uid

    return {
        "success": True,
        "message": "Login successful!",
        "token": token,
        "user": public_user,
    }


@auth_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return logged-in user's profile."""
    profile = current_user.copy()
    profile.pop("password", None)

    return {"success": True, "profile": profile}


@auth_router.get("/user/{user_id}")
async def get_user_by_id(user_id: str):
    """Return public user profile by user ID."""
    user_data = db.reference(f"users/{user_id}").get()
    if not user_data or not isinstance(user_data, dict):
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "User not found"},
        )

    public_user = user_data.copy()
    public_user.pop("password", None)
    public_user["uid"] = user_id

    return {"success": True, "user": public_user}


@auth_router.put("/profile")
async def update_profile(
    payload: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Update user profile."""
    uid = current_user["uid"]
    user_ref = db.reference(f"users/{uid}")

    updates = {}
    if "full_name" in payload:
        updates["full_name"] = payload["full_name"]
    if "phone" in payload:
        updates["phone"] = payload["phone"]
    if "bio" in payload:
        updates["bio"] = payload["bio"]
    if "profilePic" in payload:
        updates["profilePic"] = payload["profilePic"]

    if not updates:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "No changes detected!"},
        )

    user_ref.update(updates)

    return {"success": True, "message": "Profile updated successfully!"}
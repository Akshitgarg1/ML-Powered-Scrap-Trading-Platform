"""
FastAPI application for ML TradeSmart Platform.
"""

import json
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

import sys

# Load .env before importing route modules that read environment variables.
_base_dir = os.path.dirname(os.path.abspath(__file__))
if _base_dir not in sys.path:
    sys.path.insert(0, _base_dir)

load_dotenv(os.path.join(_base_dir, ".env"))
load_dotenv(os.path.join(_base_dir, "..", ".env"))
load_dotenv()

# Import FastAPI route routers
from routes.auth_routes import auth_router
from routes.product_routes import product_router
from routes.messaging_routes import messaging_router
from routes.notifications_routes import notifications_router
from routes.feedback_routes import feedback_router
from routes.user_ratings_routes import ratings_router
from routes.watchlist_routes import watchlist_router
from routes.category_routes import category_router


def init_firebase():
    """Initialize Firebase Admin SDK once."""
    try:
        if not firebase_admin._apps:
            db_url = os.getenv("DATABASE_URL")
            storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "scrap-trade-b1ea7.firebasestorage.app")

            # Check for JSON string first (recommended for production env vars)
            cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
            if cred_json:
                cred_info = json.loads(cred_json)
                if "private_key" in cred_info and not str(cred_info["private_key"]).strip().startswith("-----BEGIN"):
                    cred_info["private_key"] = f"-----BEGIN PRIVATE KEY-----\n{cred_info['private_key'].strip()}\n-----END PRIVATE KEY-----\n"
                cred = credentials.Certificate(cred_info)
                firebase_admin.initialize_app(cred, {"databaseURL": db_url, "storageBucket": storage_bucket})
                print("[INFO] Firebase initialized using FIREBASE_CREDENTIALS_JSON.")
            else:
                cred_path = os.path.join(
                    os.path.dirname(__file__),
                    os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json"),
                )
                if os.path.exists(cred_path):
                    with open(cred_path, "r", encoding="utf-8") as f:
                        cred_info = json.load(f)
                    if "private_key" in cred_info and not str(cred_info["private_key"]).strip().startswith("-----BEGIN"):
                        cred_info["private_key"] = f"-----BEGIN PRIVATE KEY-----\n{cred_info['private_key'].strip()}\n-----END PRIVATE KEY-----\n"
                    cred = credentials.Certificate(cred_info)
                    firebase_admin.initialize_app(cred, {"databaseURL": db_url, "storageBucket": storage_bucket})
                    print(f"[INFO] Firebase initialized using serviceAccountKey.json from path: {cred_path}")
                else:
                    firebase_admin.initialize_app(options={"databaseURL": db_url, "storageBucket": storage_bucket})
                    print("[INFO] Firebase initialized using default options.")
    except Exception as e:
        print(f"[WARNING] Firebase init warning: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI startup and shutdown."""
    init_firebase()
    yield


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application."""
    init_firebase()

    app = FastAPI(
        title="ML TradeSmart Platform API",
        description="FastAPI Backend for ML TradeSmart Platform",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS configuration allowing requests from frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Ensure uploads folder exists and mount static files
    uploads_dir = os.path.join(_base_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Register API routers
    app.include_router(auth_router)
    app.include_router(product_router)
    app.include_router(messaging_router)
    app.include_router(notifications_router)
    app.include_router(feedback_router)
    app.include_router(ratings_router)
    app.include_router(watchlist_router)
    app.include_router(category_router)

    # Base home route
    @app.get("/")
    async def home():
        return JSONResponse(
            status_code=200,
            content={
                "message": "ML TradeSmart Platform API",
                "status": "running",
                "version": "1.0.0",
            },
        )

    # Health check
    @app.get("/api/health")
    async def health():
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "services": [
                    "product-listings",
                    "file-upload",
                    "identity-service",
                    "messaging",
                    "notifications",
                ],
            },
        )

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "5050"))
    debug = os.getenv("FLASK_DEBUG", os.getenv("DEBUG", "1")) == "1"

    print(f"🚀 Starting FastAPI server on http://0.0.0.0:{port} (docs at http://localhost:{port}/docs)")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=debug)

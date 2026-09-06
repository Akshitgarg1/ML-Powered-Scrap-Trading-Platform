# server/routes/product_routes.py
"""
Product listing routes for FastAPI.
Handles uploading product images and managing product listings.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from urllib.parse import unquote, urlparse

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:
    cloudinary = None
from firebase_admin import db
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Query, status
from fastapi.responses import JSONResponse

from utils.auth_helper import get_current_user
from utils.firebase_db import ProductsAPI

product_router = APIRouter(prefix="/api/products", tags=["products"])

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


# ------------------------ UTIL FUNCTIONS ------------------------

def _ensure_cloudinary_configured():
    """Configure Cloudinary from environment variables."""
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    missing = []
    if not cloud_name:
        missing.append("CLOUDINARY_CLOUD_NAME")
    if not api_key:
        missing.append("CLOUDINARY_API_KEY")
    if not api_secret:
        missing.append("CLOUDINARY_API_SECRET")

    if missing:
        raise RuntimeError(f"Missing Cloudinary env vars: {', '.join(missing)}")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def allowed_file(filename: str) -> bool:
    """Return True if uploaded file has allowed image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _upload_file_to_cloudinary(file_obj, unique_filename: str) -> Optional[str]:
    """Upload file object or stream to Cloudinary and return secure URL."""
    _ensure_cloudinary_configured()
    if hasattr(file_obj, "seek"):
        file_obj.seek(0)
    result = cloudinary.uploader.upload(
        file_obj,
        public_id=f"product_images/{unique_filename}",
        overwrite=True,
        resource_type="image",
    )
    return result.get("secure_url")


def _extract_cloudinary_public_id(image_url: str) -> Optional[str]:
    """Extract Cloudinary public_id from a delivery URL."""
    if not isinstance(image_url, str):
        return None

    value = image_url.strip()
    if not value:
        return None

    parsed = urlparse(value)
    if not parsed.netloc or "cloudinary" not in parsed.netloc:
        return None

    marker = "/image/upload/"
    if marker not in parsed.path:
        return None

    tail = parsed.path.split(marker, 1)[1].strip("/")
    if not tail:
        return None

    parts = [segment for segment in tail.split("/") if segment]
    if not parts:
        return None

    version_index = -1
    for index, segment in enumerate(parts):
        if segment.startswith("v") and segment[1:].isdigit():
            version_index = index
            break

    if version_index != -1 and version_index + 1 < len(parts):
        public_path = "/".join(parts[version_index + 1 :])
    else:
        public_path = "/".join(parts)

    public_path = unquote(public_path)
    public_id, _ = os.path.splitext(public_path)
    return public_id or None


def _delete_cloudinary_image(image_url: str):
    """Delete an image from Cloudinary using its URL."""
    try:
        public_id = _extract_cloudinary_public_id(image_url)
        if not public_id:
            return True, None

        _ensure_cloudinary_configured()
        result = cloudinary.uploader.destroy(public_id, invalidate=True)
        outcome = result.get("result")
        if outcome in ["ok", "not found"]:
            return True, None
        return False, f"Cloudinary error: {outcome}"
    except Exception as exc:
        return False, str(exc)


def _normalize_image_url(url: Any) -> Optional[str]:
    """Ensure URL is valid string."""
    if not isinstance(url, str):
        return None
    val = url.strip()
    return val if val.startswith(("http://", "https://", "/uploads/")) else None


def _normalize_product_record(product: Any) -> Dict[str, Any]:
    """Standardize product fields for frontend consumption."""
    if not isinstance(product, dict):
        return {}
    p = product.copy()

    image_urls = _collect_product_image_urls(p)
    p["image_urls"] = image_urls
    p["image_url"] = image_urls[0] if image_urls else None

    try:
        p["price"] = float(p.get("price", 0))
    except (ValueError, TypeError):
        p["price"] = 0.0

    return p


def _collect_product_image_urls(product: Any) -> List[str]:
    """Collect product image URLs from image_urls and image_url fields."""
    if not isinstance(product, dict):
        return []

    urls = []
    image_urls = product.get("image_urls")
    if isinstance(image_urls, list):
        for url in image_urls:
            if isinstance(url, str) and url.strip():
                urls.append(url.strip())

    image_url = product.get("image_url")
    if isinstance(image_url, str) and image_url.strip():
        urls.append(image_url.strip())

    unique_urls = []
    seen = set()
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    return unique_urls


def _parse_image_urls_field(raw_image_urls: Any) -> List[str]:
    """Parse image_urls from JSON payloads or form fields."""
    if isinstance(raw_image_urls, list):
        return raw_image_urls

    if isinstance(raw_image_urls, str):
        value = raw_image_urls.strip()
        if not value:
            return []
        if value.startswith("["):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                return []
        return [value]

    return []


def compute_similarity_score(base: dict, candidate: dict) -> float:
    """Advanced similarity score for product recommendations."""
    if base.get("id") == candidate.get("id"):
        return -1.0

    score = 0.0

    b_cat = str(base.get("category", "")).lower()
    c_cat = str(candidate.get("category", "")).lower()
    if b_cat and b_cat == c_cat:
        score += 25.0

    b_brand = str(base.get("brand", "")).lower()
    c_brand = str(candidate.get("brand", "")).lower()
    if b_brand and c_brand and b_brand == c_brand:
        score += 12.0

    b_title_words = set(str(base.get("title", "")).lower().replace("-", " ").split())
    c_title_words = set(str(candidate.get("title", "")).lower().replace("-", " ").split())
    intersection = b_title_words.intersection(c_title_words)
    score += len(intersection) * 4.0

    try:
        p1 = float(base.get("price", 0))
        p2 = float(candidate.get("price", 0))
        if p1 > 0.0 and p2 > 0.0:
            diff_ratio = float(abs(p1 - p2) / max(p1, p2, 1.0))
            score += max(0.0, float(15.0 * (1.0 - diff_ratio)))
    except Exception:
        pass

    cond_rank = {"new": 5, "like new": 4, "excellent": 4, "good": 3, "fair": 2, "poor": 1}
    b_cond = cond_rank.get(str(base.get("condition", "")).lower(), 3)
    c_cond = cond_rank.get(str(candidate.get("condition", "")).lower(), 3)
    score -= abs(b_cond - c_cond) * 2.0

    return score


# ------------------------ IMAGE UPLOADS ------------------------

@product_router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    """Upload a single product image to Cloudinary."""
    try:
        if not image.filename:
            return JSONResponse(status_code=400, content={"success": False, "error": "No file selected"})

        if not allowed_file(image.filename):
            return JSONResponse(status_code=400, content={"success": False, "error": "Invalid image type"})

        safe_name = os.path.basename(image.filename)
        unique_filename = f"{uuid.uuid4()}_{safe_name}"

        try:
            url = _upload_file_to_cloudinary(image.file, unique_filename)
        except Exception as exc:
            return JSONResponse(status_code=500, content={"success": False, "error": f"Cloudinary upload failed: {exc}"})

        if not url:
            return JSONResponse(status_code=500, content={"success": False, "error": "Cloudinary did not return image URL"})

        return {
            "success": True,
            "filename": unique_filename,
            "url": url,
            "filepath": url,
        }
    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


@product_router.post("/upload-images")
async def upload_images(images: List[UploadFile] = File(...)):
    """Upload multiple product images to Cloudinary."""
    try:
        if not images:
            return JSONResponse(status_code=400, content={"success": False, "error": "No files selected"})

        uploaded_urls = []
        for img in images:
            if not img.filename or not allowed_file(img.filename):
                continue

            safe_name = os.path.basename(img.filename)
            unique_filename = f"{uuid.uuid4()}_{safe_name}"

            try:
                url = _upload_file_to_cloudinary(img.file, unique_filename)
                if url:
                    uploaded_urls.append(url)
            except Exception as exc:
                return JSONResponse(status_code=500, content={"success": False, "error": f"Cloudinary upload failed: {exc}"})

        return {"success": True, "urls": uploaded_urls}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ CREATE LISTING ------------------------

@product_router.post("/listings")
async def create_listing(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Create a new product listing; supports JSON or multipart form with images."""
    try:
        content_type = request.headers.get("content-type", "")

        data = {}
        uploaded_files: List[UploadFile] = []

        if "multipart/form-data" in content_type:
            form = await request.form()
            for key, value in form.items():
                if isinstance(value, UploadFile):
                    continue
                data[key] = value
            # Extract all files under 'images' key
            uploaded_files = [v for v in form.getlist("images") if isinstance(v, UploadFile)]
        else:
            try:
                data = await request.json()
            except Exception:
                data = {}

        if not data:
            return JSONResponse(status_code=400, content={"success": False, "error": "No data provided"})

        required = ["title", "price", "category", "description"]
        for field in required:
            val = data.get(field)
            if not val or (isinstance(val, str) and not val.strip()):
                return JSONResponse(status_code=400, content={"success": False, "error": f"Missing or empty required field: {field}"})

        try:
            price = float(data["price"])
            if price <= 0:
                return JSONResponse(status_code=400, content={"success": False, "error": "Price must be greater than zero."})
            if price > 10000000:
                return JSONResponse(status_code=400, content={"success": False, "error": "Price is unrealistically high."})

            curr_year = datetime.now().year
            year = int(data.get("year", curr_year))
            if year < 1900 or year > curr_year:
                return JSONResponse(status_code=400, content={"success": False, "error": f"Year must be between 1900 and {curr_year}."})
        except (ValueError, TypeError):
            return JSONResponse(status_code=400, content={"success": False, "error": "Price and Year must be valid numbers."})

        normalized_image_urls = []

        has_uploaded_files = any(f and f.filename for f in uploaded_files)
        if has_uploaded_files:
            for file_item in uploaded_files:
                if not file_item or not file_item.filename:
                    continue
                if not allowed_file(file_item.filename):
                    return JSONResponse(status_code=400, content={"success": False, "error": f"Invalid image type: {file_item.filename}"})

                safe_name = os.path.basename(file_item.filename)
                unique_filename = f"{uuid.uuid4()}_{safe_name}"

                try:
                    url = _upload_file_to_cloudinary(file_item.file, unique_filename)
                except Exception as exc:
                    return JSONResponse(status_code=500, content={"success": False, "error": f"Cloudinary upload failed: {exc}"})

                if not url:
                    return JSONResponse(status_code=500, content={"success": False, "error": "Cloudinary did not return URL"})

                normalized_image_urls.append(url)
        else:
            raw_image_urls = _parse_image_urls_field(data.get("image_urls", []))
            for raw_url in raw_image_urls:
                normalized = _normalize_image_url(raw_url)
                if normalized:
                    normalized_image_urls.append(normalized)

        new_product = {
            "title": str(data["title"]).strip(),
            "price": price,
            "category": str(data["category"]).strip(),
            "description": str(data["description"]).strip(),
            "brand": str(data.get("brand", "")).strip(),
            "condition": str(data.get("condition", "good")).lower(),
            "year": year,
            "image_urls": normalized_image_urls,
            "image_url": normalized_image_urls[0] if normalized_image_urls else None,
            "created_at": datetime.now().isoformat(),
            "user_id": current_user["uid"],
        }

        product_id = str(uuid.uuid4())
        success = ProductsAPI.create(product_id, new_product)

        if success:
            created_product = ProductsAPI.get_by_id(product_id) or new_product.copy()
            created_product["id"] = product_id
            return {"success": True, "product": _normalize_product_record(created_product)}

        return JSONResponse(status_code=500, content={"success": False, "error": "Database save failed"})

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ GET ALL LISTINGS ------------------------

@product_router.get("/listings")
async def get_listings(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    seller_id: Optional[str] = None,
):
    """Return all products with optional filtering."""
    try:
        products = ProductsAPI.get_all()

        filtered = products

        if category:
            filtered = [p for p in filtered if str(p.get("category", "")).lower() == category.lower()]

        if min_price is not None:
            filtered = [p for p in filtered if float(p.get("price", 0)) >= min_price]

        if max_price is not None:
            filtered = [p for p in filtered if float(p.get("price", 0)) <= max_price]

        if seller_id:
            filtered = [p for p in filtered if str(p.get("user_id", "")).lower() == str(seller_id).lower()]

        if search:
            search_term = search.lower()
            scored_products = []
            for p in filtered:
                score = 0
                title_lower = str(p.get("title", "")).lower()
                desc_lower = str(p.get("description", "")).lower()

                if search_term == title_lower:
                    score += 100
                elif title_lower.startswith(search_term):
                    score += 50
                elif search_term in title_lower:
                    score += 20

                if search_term in desc_lower:
                    score += 10

                if score > 0:
                    p["_search_score"] = score
                    scored_products.append(p)

            scored_products.sort(key=lambda x: x.get("_search_score", 0), reverse=True)
            for p in scored_products:
                p.pop("_search_score", None)
            filtered = scored_products

        filtered = [_normalize_product_record(p) for p in filtered]

        return {
            "success": True,
            "products": filtered,
            "total": len(filtered),
        }

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ GET MY LISTINGS ------------------------

@product_router.get("/my-listings")
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    """Get all products listed by the current authenticated user."""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            return JSONResponse(status_code=401, content={"success": False, "error": "User not authenticated"})

        products = ProductsAPI.get_all()
        my_products = [p for p in products if str(p.get("user_id", "")).lower() == str(user_id).lower()]
        my_products = [_normalize_product_record(p) for p in my_products]
        my_products.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return {
            "success": True,
            "products": my_products,
            "total": len(my_products),
        }

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ HEALTH CHECK ------------------------

@product_router.get("/health")
async def health_check():
    """Simple health status."""
    return {
        "success": True,
        "service": "Product Listings API",
        "status": "running",
    }


# ------------------------ GET SINGLE PRODUCT ------------------------

@product_router.get("/listings/{product_id}")
async def get_product(product_id: str):
    """Return one product by ID."""
    try:
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return JSONResponse(status_code=404, content={"success": False, "error": "Product not found"})

        product = _normalize_product_record(product)
        return {"success": True, "product": product}

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ DELETE PRODUCT ------------------------

@product_router.delete("/listings/{product_id}")
async def delete_listing(product_id: str):
    """Delete a product by ID and clean up Cloudinary images."""
    try:
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return JSONResponse(status_code=404, content={"success": False, "error": "Product not found"})

        delete_errors = []
        for image_url in _collect_product_image_urls(product):
            success, error = _delete_cloudinary_image(image_url)
            if not success:
                delete_errors.append({"url": image_url, "error": error})

        if delete_errors:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Failed to delete one or more Cloudinary images",
                    "details": delete_errors,
                },
            )

        success = ProductsAPI.delete(product_id)
        if success:
            return {"success": True, "product": product}

        return JSONResponse(status_code=500, content={"success": False, "error": "Database deletion failed"})

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


# ------------------------ RECOMMENDATIONS ------------------------

@product_router.get("/listings/{product_id}/recommendations")
async def recommend_products(product_id: str):
    """Return similar products using metadata matching."""
    try:
        products = ProductsAPI.get_all()
        base = ProductsAPI.get_by_id(product_id)
        if not base:
            return JSONResponse(status_code=404, content={"success": False, "error": "Product not found"})

        scored_map = {}
        for candidate in products:
            cid = str(candidate.get("id"))
            if cid == str(product_id):
                continue
            if candidate.get("status") == "sold":
                continue

            score = float(compute_similarity_score(base, candidate))
            if score > 0:
                scored_map[cid] = {"data": candidate, "score": score}

        final_scored = list(scored_map.values())
        final_scored.sort(key=lambda x: x["score"], reverse=True)

        recommendations = [
            _normalize_product_record(item.get("data"))
            for item in final_scored[:6]
            if isinstance(item, dict)
        ]

        return {
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "engine": "metadata-recommender",
        }

    except Exception as exc:
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})

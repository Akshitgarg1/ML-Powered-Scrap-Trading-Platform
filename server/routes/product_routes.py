# server/routes/product_routes.py
"""
Product listing routes.
Handles uploading product images and managing product listings.
"""

from flask import Blueprint, request, jsonify
import json
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

product_bp = Blueprint("product", __name__, url_prefix="/api/products")

PRODUCTS_FILE = "products.json"
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


# ------------------------ UTIL FUNCTIONS ------------------------

def allowed_file(filename):
    """Return True if uploaded file has allowed image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def load_products():
    """Load all product listings from storage."""
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, "r") as f:
            return json.load(f)
    return []


def save_products(products):
    """Save updated product list back to storage."""
    with open(PRODUCTS_FILE, "w") as f:
        json.dump(products, f, indent=2)


def compute_similarity_score(base, candidate):
    """Heuristic similarity score for recommendations."""
    score = 0.0

    if base["id"] == candidate["id"]:
        return -1

    if base.get("category", "").lower() == candidate.get("category", "").lower():
        score += 5

    if base.get("brand") and candidate.get("brand") and base["brand"].lower() == candidate["brand"].lower():
        score += 3

    price_a = float(base.get("price", 0) or 0)
    price_b = float(candidate.get("price", 0) or 0)
    if price_a > 0 and price_b > 0:
        diff_ratio = abs(price_a - price_b) / max(price_a, price_b)
        score += max(0, 2 - diff_ratio * 10)

    condition_map = {"excellent": 3, "good": 2, "fair": 1, "poor": 0}
    cond_a = condition_map.get(base.get("condition", "").lower(), 1)
    cond_b = condition_map.get(candidate.get("condition", "").lower(), 1)
    score -= abs(cond_a - cond_b) * 0.5

    return score


# ------------------------ IMAGE UPLOAD ------------------------

@product_bp.route("/upload-image", methods=["POST"])
def upload_image():
    """Upload product image and return filename."""
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image provided"}), 400

        file = request.files["image"]

        if not file.filename:
            return jsonify({"success": False, "error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Invalid image type"}), 400

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

        file.save(filepath)

        return jsonify({
            "success": True,
            "filename": unique_filename,
            "filepath": f"/uploads/{unique_filename}"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ CREATE LISTING ------------------------

@product_bp.route("/listings", methods=["POST"])
def create_listing():
    """Create a new product listing."""
    try:
        data = request.json

        required = ["title", "price", "category", "description"]
        for field in required:
            if not data.get(field):
                return jsonify({"success": False, "error": f"Missing field: {field}"}), 400

        products = load_products()

        new_product = {
            "id": str(uuid.uuid4()),                     # FIXED: Unique ID
            "title": data["title"],
            "price": float(data["price"]),
            "category": data["category"],
            "description": data["description"],
            "brand": data.get("brand", ""),
            "condition": data.get("condition", "good"),
            "year": data.get("year", 2024),
            "image_url": data.get("image_url", ""),
            "created_at": datetime.now().isoformat(),
            "user_id": data.get("user_id", "demo_user")
        }

        products.append(new_product)
        save_products(products)

        return jsonify({"success": True, "product": new_product}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ GET ALL LISTINGS ------------------------

@product_bp.route("/listings", methods=["GET"])
def get_listings():
    """Return all products with optional filtering."""
    try:
        products = load_products()

        category = request.args.get("category")
        min_price = request.args.get("min_price")
        max_price = request.args.get("max_price")
        search = request.args.get("search")

        filtered = products

        if category:
            filtered = [p for p in filtered if p["category"].lower() == category.lower()]

        if min_price:
            filtered = [p for p in filtered if p["price"] >= float(min_price)]

        if max_price:
            filtered = [p for p in filtered if p["price"] <= float(max_price)]

        if search:
            search_term = search.lower()
            scored_products = []
            for p in filtered:
                score = 0
                title_lower = p["title"].lower()
                desc_lower = p["description"].lower()
                
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
            
            scored_products.sort(key=lambda x: x["_search_score"], reverse=True)
            # Remove the temporary score key before sending
            for p in scored_products:
                p.pop("_search_score", None)
            filtered = scored_products

        return jsonify({
            "success": True,
            "products": filtered,
            "total": len(filtered)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ GET SINGLE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["GET"])    # FIXED: int removed
def get_product(product_id):
    """Return one product by ID."""
    try:
        products = load_products()
        product = next((p for p in products if p["id"] == product_id), None)

        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        return jsonify({"success": True, "product": product}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ DELETE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["DELETE"])   # FIXED: int removed
def delete_listing(product_id):
    """Delete a product by ID."""
    try:
        products = load_products()

        index = next((i for i, p in enumerate(products) if p["id"] == product_id), None)

        if index is None:
            return jsonify({"success": False, "error": "Product not found"}), 404

        deleted = products.pop(index)
        save_products(products)

        return jsonify({"success": True, "product": deleted}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ HEALTH CHECK ------------------------

@product_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health status."""
    return jsonify({
        "success": True,
        "service": "Product Listings API",
        "status": "running"
    }), 200


@product_bp.route("/listings/<product_id>/recommendations", methods=["GET"])
def recommend_products(product_id):
    """Return similar products for the provided product id."""
    try:
        products = load_products()
        base = next((p for p in products if p["id"] == product_id), None)
        if not base:
            return jsonify({"success": False, "error": "Product not found"}), 404

        scored = []
        for candidate in products:
            score = compute_similarity_score(base, candidate)
            if score <= 0:
                continue
            scored.append((score, candidate))

        scored.sort(key=lambda item: item[0], reverse=True)
        recommendations = [item[1] for item in scored[:6]]

        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

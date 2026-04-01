# server/routes/product_routes.py
"""
Product listing routes.
Handles uploading product images and managing product listings.
"""

from flask import Blueprint, request, jsonify
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from utils.firebase_db import ProductsAPI

product_bp = Blueprint("product", __name__, url_prefix="/api/products")

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


# ------------------------ UTIL FUNCTIONS ------------------------

def allowed_file(filename):
    """Return True if uploaded file has allowed image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def compute_similarity_score(base, candidate):
    """Advanced similarity score for product recommendations."""
    if base.get("id") == candidate.get("id"):
        return -1.0
        
    score = 0.0

    # 1. Category Match (Very Strong signal)
    b_cat = str(base.get("category", "")).lower()
    c_cat = str(candidate.get("category", "")).lower()
    if b_cat and b_cat == c_cat:
        score += 25.0

    # 2. Brand Match (Strong signal)
    b_brand = str(base.get("brand", "")).lower()
    c_brand = str(candidate.get("brand", "")).lower()
    if b_brand and c_brand and b_brand == c_brand:
        score += 12.0

    # 3. Title Word overlap (Lexical Similarity)
    b_title_words = set(str(base.get("title", "")).lower().replace('-', ' ').split())
    c_title_words = set(str(candidate.get("title", "")).lower().replace('-', ' ').split())
    intersection = b_title_words.intersection(c_title_words)
    score += (len(intersection) * 4.0)

    # 4. Price Proximity (Scored 0 to 15)
    try:
        p1 = float(base.get("price", 0))
        p2 = float(candidate.get("price", 0))
        if p1 > 0.0 and p2 > 0.0:
            diff_ratio = float(abs(p1 - p2) / max(p1, p2, 1.0))
            price_score = float(15.0 * (1.0 - diff_ratio))
            score += max(0.0, price_score)
    except: pass

    # 5. Condition Rank (Penalize gap)
    cond_rank = {"new": 5, "like new": 4, "excellent": 4, "good": 3, "fair": 2, "poor": 1}
    b_cond = cond_rank.get(str(base.get("condition", "")).lower(), 3)
    c_cond = cond_rank.get(str(candidate.get("condition", "")).lower(), 3)
    score -= abs(b_cond - c_cond) * 2.0

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
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        required = ["title", "price", "category", "description"]
        for field in required:
            val = data.get(field)
            if not val or (isinstance(val, str) and not val.strip()):
                return jsonify({"success": False, "error": f"Missing or empty required field: {field}"}), 400

        # Sanity check for price and year (Edge Cases)
        try:
            price = float(data["price"])
            if price <= 0:
                return jsonify({"success": False, "error": "Price must be greater than zero."}), 400
            if price > 10000000: # 1 Crore limit for second-hand platform sanity
                return jsonify({"success": False, "error": "Price is unrealistically high."}), 400
            
            curr_year = datetime.now().year
            year = int(data.get("year", curr_year))
            if year < 1900 or year > curr_year:
                return jsonify({"success": False, "error": f"Year must be between 1900 and {curr_year}."}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Price and Year must be valid numbers."}), 400

        new_product = {
            "title": str(data["title"]).strip(),
            "price": price,
            "category": str(data["category"]).strip(),
            "description": str(data["description"]).strip(),
            "brand": str(data.get("brand", "")).strip(),
            "condition": str(data.get("condition", "good")).lower(),
            "year": year,
            "image_url": str(data.get("image_url", "")),
            "created_at": datetime.now().isoformat(),
            "user_id": str(data.get("user_id", "demo_user"))
        }

        product_id = str(uuid.uuid4())
        # Save to Firebase Realtime Database exclusively
        success = ProductsAPI.create(product_id, new_product)
        
        if success:
            new_product["id"] = product_id
            return jsonify({"success": True, "product": new_product}), 200
        else:
            return jsonify({"success": False, "error": "Database save failed"}), 500

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ GET ALL LISTINGS ------------------------

@product_bp.route("/listings", methods=["GET"])
def get_listings():
    """Return all products with optional filtering."""
    try:
        products = ProductsAPI.get_all()

        category = request.args.get("category")
        min_price = request.args.get("min_price")
        max_price = request.args.get("max_price")
        search = request.args.get("search")

        filtered = products

        if category:
            filtered = [p for p in filtered if str(p.get("category", "")).lower() == category.lower()]

        if min_price:
            try:
                m_p = float(min_price)
                filtered = [p for p in filtered if float(p.get("price", 0)) >= m_p]
            except: pass

        if max_price:
            try:
                mx_p = float(max_price)
                filtered = [p for p in filtered if float(p.get("price", 0)) <= mx_p]
            except: pass

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

        return jsonify({
            "success": True,
            "products": filtered,
            "total": len(filtered)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ GET SINGLE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["GET"])
def get_product(product_id):
    """Return one product by ID."""
    try:
        product = ProductsAPI.get_by_id(product_id)

        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        return jsonify({"success": True, "product": product}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------ DELETE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["DELETE"])
def delete_listing(product_id):
    """Delete a product by ID."""
    try:
        product = ProductsAPI.get_by_id(product_id)

        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        success = ProductsAPI.delete(product_id)
        
        if success:
            return jsonify({"success": True, "product": product}), 200
        else:
            return jsonify({"success": False, "error": "Database deletion failed"}), 500

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
    """Return similar products using advanced hybrid recommendation logic (ML + Heuristics)."""
    try:
        from ml_services.image_search.search_engine import enhanced_search
        
        products = ProductsAPI.get_all()
        base = ProductsAPI.get_by_id(product_id)
        if not base:
            return jsonify({"success": False, "error": "Product not found"}), 404

        scored_map = {}
        for candidate in products:
            cid = str(candidate.get("id"))
            if cid == str(product_id):
                continue
            
            # Skip sold items
            if candidate.get("status") == "sold":
                continue

            score = float(compute_similarity_score(base, candidate))
            if score > 0:
                scored_map[cid] = {"data": candidate, "score": score}

        # --- ML Layer: Visual Similarity Boost ---
        # If the base product has an image, we can fetch visual matches from the ML index
        img_url = base.get("image_url", "")
        if img_url:
            filename = os.path.basename(img_url)
            local_path = os.path.join(UPLOAD_FOLDER, filename)
            
            if os.path.exists(local_path):
                # Search for visually similar items in the precomputed index
                visual_result = enhanced_search.search_similar_images(local_path, top_k=15)
                if visual_result.get("success"):
                    for vis_item in visual_result.get("results", []):
                        vis_id = str(vis_item.get("product_id"))
                        # Apply a significant boost for high visual similarity
                        if vis_id in scored_map:
                            match_meta = scored_map[vis_id]
                            visual_sim = float(vis_item.get("similarity_score", 0.0))
                            boost = float(visual_sim * 20.0)
                            current_score = float(match_meta.get("score", 0.0))
                            match_meta["score"] = current_score + boost
                            match_meta["is_visual_match"] = True

        # Sort combined results
        final_scored = list(scored_map.values())
        final_scored.sort(key=lambda x: x["score"], reverse=True)
        
        # Take the top N candidates
        limit = 6
        recommendations = [item.get("data") for item in final_scored[:limit] if isinstance(item, dict)]

        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "engine": "v2.5-hybrid-ml-recommender"
        }), 200

    except Exception as e:
        print(f"DEBUG: Recommendation error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

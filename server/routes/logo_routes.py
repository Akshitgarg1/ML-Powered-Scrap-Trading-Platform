"""Routes for fake logo verification service."""

import os
import uuid
from flask import Blueprint, jsonify, request, send_from_directory

from ml_services.logo_verifier import get_available_brands, verify_logo

logo_bp = Blueprint("logo", __name__, url_prefix="/api/logo")


@logo_bp.route("/brands", methods=["GET"])
def list_brands():
    return jsonify({"success": True, "brands": get_available_brands()})


@logo_bp.route("/reference/<brand>/<filename>", methods=["GET"])
def serve_reference_logo(brand, filename):
    base_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "ml_services",
        "logo_verifier",
        "reference_logos",
        brand.lower(),
    )
    base_dir = os.path.abspath(base_dir)
    if not os.path.exists(os.path.join(base_dir, filename)):
        return jsonify({"success": False, "error": "Logo not found"}), 404
    return send_from_directory(base_dir, filename)


@logo_bp.route("/verify", methods=["POST"])
def verify_logo_route():
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "Image is required"}), 400
        image_file = request.files["image"]
        if image_file.filename == "":
            return jsonify({"success": False, "error": "No file selected"}), 400

        brand_hint = request.form.get("brand") or request.args.get("brand")

        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        extension = image_file.filename.rsplit(".", 1)[-1].lower()
        temp_path = os.path.join(upload_dir, f"{uuid.uuid4()}.{extension}")
        image_file.save(temp_path)

        result = verify_logo(temp_path, brand_hint)

        try:
            os.remove(temp_path)
        except OSError:
            pass

        return jsonify(result), 200 if result.get("success") else 400

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


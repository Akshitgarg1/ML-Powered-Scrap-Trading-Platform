"""Routes for logo verification service."""

import os
import uuid
from flask import Blueprint, jsonify, request, send_from_directory
from pathlib import Path

from ml_services.logo_verifier import get_available_brands, verify_logo

logo_bp = Blueprint("logo", __name__, url_prefix="/api/logo")

# Correct reference path based on new data structure
BASE_DIR = Path(__file__).resolve().parent
REFERENCE_LOGO_DIR = BASE_DIR.parents[1] / "data" / "raw" / "logo_detection" / "Logos"


@logo_bp.route("/brands", methods=["GET"])
def list_brands():
    """Lists all brands currently in the reference database."""
    return jsonify({"success": True, "brands": get_available_brands()})


@logo_bp.route("/reference/<filename>", methods=["GET"])
def serve_reference_logo(filename):
    """Serves a reference logo image for display."""
    if not REFERENCE_LOGO_DIR.exists():
        return jsonify({"success": False, "error": "Reference directory not found"}), 404
        
    file_path = REFERENCE_LOGO_DIR / filename
    if not file_path.exists():
        return jsonify({"success": False, "error": f"Logo '{filename}' not found"}), 404
        
    return send_from_directory(str(REFERENCE_LOGO_DIR), filename)


@logo_bp.route("/verify", methods=["POST"])
def verify_logo_route():
    """Verifies an uploaded logo against the reference database."""
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

        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500

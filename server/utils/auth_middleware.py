from functools import wraps
from flask import request, jsonify
from firebase_admin import auth

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"success": False, "message": "Authentication token is missing!"}), 401

        try:
            # Verify the Firebase token
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token  # Contains uid, email, etc.
        except Exception as e:
            return jsonify({
                "success": False, 
                "message": "Invalid authentication token!",
                "error": str(e)
            }), 401

        return f(*args, **kwargs)

    return decorated

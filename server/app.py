

# IMPORT TENSORFLOW FIRST (CRITICAL FOR WINDOWS DLLs)
try:
    import tensorflow as tf
    print("[INFO] TensorFlow loaded successfully.")
except Exception as e:
    print(f"[WARNING] TensorFlow loading failed: {e}")

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, db

# Importing route blueprints

from routes.ai_routes import ai_bp
from routes.image_routes import image_bp
from routes.product_routes import product_bp
from routes.logo_routes import logo_bp
from routes.feedback_routes import feedback_bp
from routes.escrow_routes import escrow_bp
from routes.auth_routes import auth_bp
from routes.messaging_routes import messaging_bp
from routes.wallet_routes import wallet_bp
from routes.dispute_routes import dispute_bp
from routes.user_ratings_routes import ratings_bp
from routes.watchlist_routes import watchlist_bp
from routes.category_routes import category_bp
from routes.shipment_routes import shipment_bp

# Load environment variables FIRST
load_dotenv()
app = Flask(__name__)

# Then use them
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

def create_app():
    """Initializes and configures the Flask application."""
    app = Flask(__name__)

    # Initialize Firebase Admin SDK
    try:
        if not firebase_admin._apps:
            db_url = "https://scrap-trade-b1ea7-default-rtdb.asia-southeast1.firebasedatabase.app"
            cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {'databaseURL': db_url})
            else:
                firebase_admin.initialize_app(options={'databaseURL': db_url})
            print(f"[INFO] Firebase initialized with: {db_url}")
    except Exception as e:
        print(f"[WARNING] Firebase init warning: {e}")

    # Allow API access from frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Basic configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # Ensure uploads folder exists
    os.makedirs('uploads', exist_ok=True)

    # Registering all modular routes
    app.register_blueprint(ai_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(logo_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(escrow_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(messaging_bp)
    app.register_blueprint(wallet_bp)
    app.register_blueprint(dispute_bp)
    app.register_blueprint(ratings_bp)
    app.register_blueprint(watchlist_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(shipment_bp)

    # Route to serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory('uploads', filename)

    # Basic home route
    @app.route('/')
    def home():
        return jsonify({
            'message': 'ML TradeSmart Platform API',
            'status': 'running',
            'version': '1.0.0'
        })

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'services': [
                'price-prediction',
                'image-search',
                'product-listings',
                'file-upload',
                'identity-service'
            ]
        })

    return app


if __name__ == '__main__':
    app = create_app()
    # Host 0.0.0.0 is better for internal testing
    app.run(debug=True, host='0.0.0.0', port=5000)

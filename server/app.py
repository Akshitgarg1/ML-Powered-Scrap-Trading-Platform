

# IMPORT TENSORFLOW FIRST (OPTIONAL - FOR AI FEATURES ONLY)
try:
    import tensorflow as tf
    print("[INFO] TensorFlow loaded successfully.")
    TF_AVAILABLE = True
except Exception as e:
    print(f"[WARNING] TensorFlow not available - AI features disabled: {e}")
    TF_AVAILABLE = False

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, db, storage

# Importing route blueprints

from routes.auth_routes import auth_bp
from routes.escrow_routes import escrow_bp
from routes.payment_routes import payment_bp
from routes.notifications_routes import notifications_bp
from routes.product_routes import product_bp
from routes.messaging_routes import messaging_bp
from routes.wallet_routes import wallet_bp
from routes.shipment_routes import shipment_bp

# Optional AI routes (only if TensorFlow is available)
if TF_AVAILABLE:
    try:
        from routes.ai_routes import ai_bp
    except Exception as e:
        print(f"[WARNING] AI routes not loaded: {e}")
        ai_bp = None
    
    try:
        from routes.image_routes import image_bp
    except Exception as e:
        print(f"[WARNING] Image routes not loaded: {e}")
        image_bp = None
    
    try:
        from routes.logo_routes import logo_bp
    except Exception as e:
        print(f"[WARNING] Logo routes not loaded: {e}")
        logo_bp = None
else:
    ai_bp = None
    image_bp = None
    logo_bp = None

# Other routes that may depend on optional modules
try:
    from routes.feedback_routes import feedback_bp
except:
    feedback_bp = None

try:
    from routes.dispute_routes import dispute_bp
except:
    dispute_bp = None

try:
    from routes.user_ratings_routes import ratings_bp
except:
    ratings_bp = None

try:
    from routes.watchlist_routes import watchlist_bp
except:
    watchlist_bp = None

try:
    from routes.category_routes import category_bp
except:
    category_bp = None

def create_app():
    """Initializes and configures the Flask application."""
    # Load environment variables
    load_dotenv()
    
    app = Flask(__name__)

    # Basic configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # Initialize Firebase Admin SDK
    try:
        if not firebase_admin._apps:
            db_url = os.getenv('DATABASE_URL')
            storage_bucket = os.getenv('FIREBASE_STORAGE_BUCKET', 'scrap-trade-b1ea7.appspot.com')
            cred_path = os.path.join(os.path.dirname(__file__), os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json'))
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {'databaseURL': db_url, 'storageBucket': storage_bucket})
            else:
                firebase_admin.initialize_app(options={'databaseURL': db_url, 'storageBucket': storage_bucket})
            print(f"[INFO] Firebase initialized with: {db_url} and storage bucket {storage_bucket}")
    except Exception as e:
        print(f"[WARNING] Firebase init warning: {e}")

    # Allow API access from frontend and permit authorization headers
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
    )

    # Ensure uploads folder exists
    os.makedirs('uploads', exist_ok=True)

    # Registering all modular routes (only if they loaded successfully)
    if ai_bp:
        app.register_blueprint(ai_bp)
    if image_bp:
        app.register_blueprint(image_bp)
    app.register_blueprint(product_bp)
    if logo_bp:
        app.register_blueprint(logo_bp)
    if feedback_bp:
        app.register_blueprint(feedback_bp)
    app.register_blueprint(escrow_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(messaging_bp)
    app.register_blueprint(wallet_bp)
    if dispute_bp:
        app.register_blueprint(dispute_bp)
    if ratings_bp:
        app.register_blueprint(ratings_bp)
    if watchlist_bp:
        app.register_blueprint(watchlist_bp)
    if category_bp:
        app.register_blueprint(category_bp)
    app.register_blueprint(shipment_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(payment_bp)

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

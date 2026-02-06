from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

# Importing route blueprints
from routes.ai_routes import ai_bp
from routes.image_routes import image_bp
from routes.product_routes import product_bp
from routes.logo_routes import logo_bp


def create_app():
    """Initializes and configures the Flask application."""
    app = Flask(__name__)

    # Allow API access from frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Basic configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB file upload limit

    # Ensure uploads folder exists
    os.makedirs('uploads', exist_ok=True)

    # Registering all modular routes
    app.register_blueprint(ai_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(logo_bp)

    # Route to serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory('uploads', filename)

    # Basic home route for quick testing
    @app.route('/')
    def home():
        return jsonify({
            'message': 'ML Scrap Trading Platform API',
            'status': 'running',
            'version': '1.0.0'
        })

    # Simple health check route
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'services': [
                'price-prediction',
                'image-search',
                'product-listings',
                'file-upload'
            ]
        })

    return app


# Start the application server
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

# server/routes/ai_routes.py
"""
AI-related API routes.
Currently handles product price prediction.
"""

from flask import Blueprint, request, jsonify
from ml_services.price_predictor.predictor import predict_price
from ml_services.price_predictor import predictor as price_predictor

# Blueprint for AI routes
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')


@ai_bp.route('/predict-price', methods=['POST'])
def predict_price_route():
    """Predicts the estimated resale price of a product."""
    try:
        data = request.get_json()

        # Basic validation
        required_fields = ['category', 'brand', 'original_price', 'age_years', 'condition']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Validate original_price against model's training distribution (if available)
        try:
            # original_price is the 3rd feature in the model's feature vector
            mean = float(price_predictor.scaler.mean_[2])
            std = float(price_predictor.scaler.var_[2]) ** 0.5
            lower = max(1.0, mean - 3 * std)
            upper = mean + 3 * std
            orig = float(data.get('original_price', 0))
            if orig < lower or orig > upper:
                return jsonify({
                    'success': False,
                    'error': f'original_price ({orig}) is outside the supported range ({lower:.2f} - {upper:.2f}). Please enter a realistic price.'
                }), 400
        except Exception:
            # If scaler or stats are not available, skip range validation
            pass

        # Run prediction
        result = predict_price(data)

        # If model returns error
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 400

        return jsonify({'success': True, 'data': result}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@ai_bp.route('/test', methods=['GET'])
def test_route():
    """Simple test route to check AI API status."""
    return jsonify({
        'success': True,
        'message': 'AI routes are working'
    }), 200


@ai_bp.route('/price-range', methods=['GET'])
def price_range_route():
    """Returns supported original_price range computed from training scaler stats."""
    try:
        mean = float(price_predictor.scaler.mean_[2])
        std = float(price_predictor.scaler.var_[2]) ** 0.5
        lower = max(1.0, mean - 3 * std)
        upper = mean + 3 * std
        return jsonify({'success': True, 'data': {'lower': lower, 'upper': upper, 'mean': mean, 'std': std}}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

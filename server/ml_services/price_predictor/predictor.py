# server/ml_services/price_predictor/predictor.py
"""
Price prediction module using trained ML model.
Encodes product attributes, processes features and returns estimated resale value.
"""

import joblib
import numpy as np
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained model, scaler and encoders
model = joblib.load(os.path.join(CURRENT_DIR, 'model.pkl'))
scaler = joblib.load(os.path.join(CURRENT_DIR, 'scaler.pkl'))
label_encoders = joblib.load(os.path.join(CURRENT_DIR, 'label_encoders.pkl'))


def predict_price(product_data):
    """
    Predicts the resale price of a product using pre-trained ML model.
    """

    try:
        # Encode categorical fields
        category = label_encoders['category'].transform([product_data['category']])[0]
        brand = label_encoders['brand'].transform([product_data['brand']])[0]
        condition_raw = product_data['condition']
        condition = label_encoders['condition'].transform([condition_raw])[0]
        location = label_encoders['location'].transform([product_data['location']])[0]

        # Numeric inputs
        original_price = float(product_data['original_price'])
        age_years = float(product_data['age_years'])
        has_warranty = int(product_data.get('has_warranty', False))
        has_box = int(product_data.get('has_box', False))
        usage_hours = float(product_data.get('usage_hours', 0))

        # Derived features
        estimated_resale = original_price * (1 - age_years * 0.15)
        depreciation_rate = (original_price - estimated_resale) / original_price

        if age_years <= 1:
            age_category = 0
        elif age_years <= 2:
            age_category = 1
        elif age_years <= 3:
            age_category = 2
        else:
            age_category = 3

        usage_intensity = usage_hours / (age_years * 365 + 1)

        # Prepare feature vector
        features = np.array([[
            category,
            brand,
            original_price,
            age_years,
            condition,
            location,
            has_warranty,
            has_box,
            depreciation_rate,
            age_category,
            usage_intensity
        ]])

        # Scale and predict
        features_scaled = scaler.transform(features)
        base_price = model.predict(features_scaled)[0]
        base_price = max(0, base_price)

        # Business-rule adjustments for more realistic behaviour
        condition_adjustments = {
            'excellent': 0.12,
            'good': 0.05,
            'fair': -0.12,
            'poor': -0.28,
        }
        condition_key = condition_raw.strip().lower()
        total_delta = 0.0
        explanations = []

        if condition_key in condition_adjustments:
            delta = condition_adjustments[condition_key]
            total_delta += delta
            explanations.append(
                f"Condition ({condition_raw}) {'adds' if delta > 0 else 'reduces'} {abs(delta)*100:.0f}%"
            )

        if has_warranty:
            total_delta += 0.07
            explanations.append("Warranty adds 7% premium")

        if has_box:
            total_delta += 0.03
            explanations.append("Original box adds 3% premium")

        if age_years <= 1:
            total_delta += 0.05
            explanations.append("Recent purchase (+5%)")
        elif age_years > 3:
            total_delta -= 0.08
            explanations.append("Older than 3 years (-8%)")

        if usage_hours > (age_years + 0.2) * 400:
            total_delta -= 0.06
            explanations.append("Heavy usage detected (-6%)")

        adjusted_price = base_price * (1 + total_delta)
        adjusted_price = max(0, adjusted_price)

        # ±10% price range around adjusted price
        margin = adjusted_price * 0.10

        return {
            'predicted_price': round(adjusted_price, 2),
            'price_range': {
                'min': round(max(0, adjusted_price - margin), 2),
                'max': round(adjusted_price + margin, 2)
            },
            'currency': '₹',
            'message': f"Estimated resale value: ₹{int(adjusted_price):,}",
            'explanations': explanations,
            'base_prediction': round(base_price, 2)
        }

    except Exception as e:
        return {'error': str(e)}

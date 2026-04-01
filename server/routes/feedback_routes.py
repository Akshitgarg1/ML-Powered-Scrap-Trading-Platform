from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from utils.firebase_db import FeedbackAPI

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

# ==========================================
# Product-Specific Feedback Routes
# ==========================================

@feedback_bp.route('/product', methods=['POST'])
def submit_product_feedback():
    """
    Submit feedback for a specific product.
    Validates input and stores the feedback in the Firebase Realtime Database.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Extract and validate required fields
        product_id = data.get('product_id')
        rating = data.get('rating')
        comment = str(data.get('comment', '')).strip()
        user_name = str(data.get('user_name', '')).strip()

        if not product_id:
            return jsonify({'success': False, 'error': 'product_id is required'}), 400
        
        # Ensure rating is between 1 and 5; default to 5 if invalid
        try:
            rating = int(rating)
            rating = max(1, min(5, rating))
        except (ValueError, TypeError):
            rating = 5 

        # Validate comment length constraints
        if len(comment) < 3:
            return jsonify({'success': False, 'error': 'Comment too short (min 3 chars)'}), 400
        if len(comment) > 2000:
            comment = comment[:2000] # Trim excessive input

        # Assign default user name if missing
        if not user_name:
            user_name = "Anonymous"

        # Construct feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "product_id": str(product_id),
            "rating": rating,
            "comment": comment,
            "user_name": user_name,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to Firebase Realtime Database using the dedicated API
        success = FeedbackAPI.add_product_feedback(feedback_id, feedback)
        
        if success:
            return jsonify({'success': True, 'feedback_id': feedback_id}), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save feedback to database'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/product/<product_id>', methods=['GET'])
def get_product_feedback(product_id):
    """
    Get all feedback associated with a specific product ID.
    Calculates the average rating across all retrieved product feedback.
    """
    try:
        # Retrieve all feedback for the product via Firebase
        product_feedback = FeedbackAPI.get_product_feedback(product_id)
        
        if not product_feedback:
            return jsonify({
                'success': True,
                'feedback': [],
                'average_rating': 0,
                'total_reviews': 0
            })

        # Calculate the average product rating
        avg_rating = sum(int(f.get("rating", 0)) for f in product_feedback) / len(product_feedback)
        
        return jsonify({
            'success': True,
            'feedback': product_feedback,
            'average_rating': round(avg_rating, 1),
            'total_reviews': len(product_feedback)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# ==========================================
# General Platform Feedback Routes
# ==========================================

@feedback_bp.route('/general', methods=['POST'])
def submit_general_feedback():
    """
    Submit general platform feedback, feature requests, or suggestions.
    Stores the generalized feedback into Firebase Realtime Database.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Extract fields
        msg = str(data.get('message', '')).strip()
        f_type = str(data.get('type', 'suggestion')).lower()
        email = str(data.get('user_email', '')).strip()

        if not msg:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        # Construct general feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "type": f_type,
            "message": msg[:2000], # Cap message size 
            "user_email": email,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to Firebase Realtime Database
        success = FeedbackAPI.add_general_feedback(feedback_id, feedback)
        
        if success:
            return jsonify({'success': True, 'feedback_id': feedback_id}), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save feedback to database'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/general', methods=['GET'])
def get_general_feedback():
    """
    Retrieve all general platform feedback from the database.
    """
    try:
        general_feedback = FeedbackAPI.get_general_feedback()
        return jsonify({
            'success': True,
            'feedback': general_feedback
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
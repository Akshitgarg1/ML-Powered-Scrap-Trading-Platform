from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime
import uuid

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

FEEDBACK_FILE = "feedback_store.json"

def load_feedback():
    """Load all feedback from storage."""
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r') as f:
            return json.load(f)
    return {"product_feedback": [], "general_feedback": []}

def save_feedback(data):
    """Save feedback to storage."""
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Product-specific feedback
@feedback_bp.route('/product', methods=['POST'])
def submit_product_feedback():
    """Submit feedback for a specific product."""
    try:
        data = request.json
        feedback = {
            "id": str(uuid.uuid4()),
            "product_id": data.get('product_id'),
            "rating": data.get('rating'),  # 1-5
            "comment": data.get('comment'),
            "user_name": data.get('user_name'),
            "timestamp": datetime.now().isoformat()
        }
        
        all_feedback = load_feedback()
        all_feedback["product_feedback"].append(feedback)
        save_feedback(all_feedback)
        
        return jsonify({'success': True, 'feedback_id': feedback['id']}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/product/<product_id>', methods=['GET'])
def get_product_feedback(product_id):
    """Get all feedback for a specific product."""
    try:
        all_feedback = load_feedback()
        product_feedback = [f for f in all_feedback["product_feedback"] 
                          if f["product_id"] == product_id]
        avg_rating = sum(f["rating"] for f in product_feedback) / len(product_feedback) if product_feedback else 0
        
        return jsonify({
            'success': True,
            'feedback': product_feedback,
            'average_rating': round(avg_rating, 1),
            'total_reviews': len(product_feedback)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# General platform feedback
@feedback_bp.route('/general', methods=['POST'])
def submit_general_feedback():
    """Submit general platform feedback."""
    try:
        data = request.json
        feedback = {
            "id": str(uuid.uuid4()),
            "type": data.get('type'),  # "bug", "feature", "suggestion"
            "message": data.get('message'),
            "user_email": data.get('user_email'),
            "timestamp": datetime.now().isoformat()
        }
        
        all_feedback = load_feedback()
        all_feedback["general_feedback"].append(feedback)
        save_feedback(all_feedback)
        
        return jsonify({'success': True, 'feedback_id': feedback['id']}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/general', methods=['GET'])
def get_general_feedback():
    """Get all general feedback."""
    try:
        all_feedback = load_feedback()
        return jsonify({
            'success': True,
            'feedback': all_feedback["general_feedback"]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
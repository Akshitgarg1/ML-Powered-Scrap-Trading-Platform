from flask import Blueprint, request, jsonify
from utils.firebase_db import WalletAPI
import uuid

wallet_bp = Blueprint("wallet", __name__, url_prefix="/api/wallet")

@wallet_bp.route("/<user_id>", methods=["GET"])
def get_balance(user_id):
    """Get the wallet balance for a user."""
    wallet = WalletAPI.get_balance(user_id)
    return jsonify({"success": True, "wallet": wallet})

@wallet_bp.route("/transaction", methods=["POST"])
def add_transaction():
    """Add a deposit or withdrawal transaction to the wallet."""
    data = request.json
    user_id = data.get('user_id')
    amount = float(data.get('amount', 0))
    t_type = data.get('type', 'DEPOSIT')  # DEPOSIT, WITHDRAWAL, ESCROW_RELEASE
    
    if not user_id or amount <= 0:
        return jsonify({"success": False, "error": "Invalid user_id or amount"}), 400
        
    transaction_id = f"tx_{uuid.uuid4().hex[:12]}"
    # Deduct if withdrawal
    final_amount = -amount if t_type == 'WITHDRAWAL' else amount
    
    success = WalletAPI.add_transaction(transaction_id, user_id, final_amount, t_type)
    if success:
        wallet = WalletAPI.get_balance(user_id)
        return jsonify({
            "success": True, 
            "transaction_id": transaction_id, 
            "new_balance": wallet.get('balance')
        })
    return jsonify({"success": False, "error": "Transaction failed"}), 500

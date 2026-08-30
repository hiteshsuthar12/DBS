import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, tableInfo } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="empty-cart container">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your order yet.</p>
                <Link to="/menu" className="btn-primary" style={{ marginTop: '1.5rem' }}>
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-container container">
            <div className="cart-header">
                <h2>Your Order</h2>
                <button onClick={clearCart} className="clear-cart-btn">
                    <Trash2 size={16} /> Clear Cart
                </button>
            </div>

            {!tableInfo && (
                <div className="alert-warning" style={{marginBottom: '1rem'}}>
                    Warning: You have not scanned a table QR code. You won't be able to place an order.
                </div>
            )}

            <div className="cart-items">
                {cart.map(item => (
                    <div key={item._id} className="cart-item card">
                        {item.image && (
                            <img src={item.image} alt={item.name} className="cart-item-img" />
                        )}
                        <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <p className="cart-item-price">₹{item.price}</p>
                        </div>
                        <div className="cart-item-actions">
                            <div className="quantity-controls">
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                                    <Minus size={16} />
                                </button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button className="remove-item-btn" onClick={() => removeFromCart(item._id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary card">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal()}</span>
                </div>
                <div className="summary-row">
                    <span>Tax (5%)</span>
                    <span>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{(getCartTotal() * 1.05).toFixed(2)}</span>
                </div>

                <button 
                    className="btn-primary checkout-btn"
                    onClick={() => navigate('/checkout')}
                    disabled={!tableInfo}
                >
                    Proceed to Checkout <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Cart;

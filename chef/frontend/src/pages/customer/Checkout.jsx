import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cart, tableInfo, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePlaceOrder = async () => {
        if (!tableInfo) {
            setError('No table information found. Please scan the QR code on your table again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const items = cart.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
            }));

            const res = await axios.post('/orders', {
                tableId: tableInfo._id,
                items
            });

            if (res.data.success) {
                clearCart();
                navigate(`/order/${res.data.data._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
                <p>Your cart is empty.</p>
                <button className="btn-primary" onClick={() => navigate('/menu')} style={{marginTop: '1rem'}}>Back to Menu</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Checkout</h2>
            
            {error && <div className="alert-warning" style={{marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderLeftColor: '#ef4444'}}>{error}</div>}

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Order Details</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Table</p>
                    <p style={{ fontWeight: '600' }}>Table {tableInfo?.tableNumber}</p>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Subtotal</span>
                        <span>₹{getCartTotal()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Tax (5%)</span>
                        <span>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.25rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <span>Total to Pay</span>
                        <span style={{ color: 'var(--primary-color)' }}>₹{(getCartTotal() * 1.05).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
                onClick={handlePlaceOrder}
                disabled={loading}
            >
                {loading ? 'Processing...' : (
                    <>
                        <CheckCircle size={20} /> Place Order
                    </>
                )}
            </button>
            <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem'}}>
                Payment will be collected at the table or counter.
            </p>
        </div>
    );
};

export default Checkout;

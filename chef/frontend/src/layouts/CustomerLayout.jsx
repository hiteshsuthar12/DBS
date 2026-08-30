import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import './CustomerLayout.css';

const CustomerLayout = () => {
    const { cart, tableInfo } = useCart();
    const navigate = useNavigate();

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="customer-layout">
            <header className="glass-header customer-header">
                <div className="container header-content">
                    <div className="logo" onClick={() => navigate('/menu')}>
                        🍔 Smart Resto
                    </div>
                    {tableInfo && (
                        <div className="table-indicator">
                            Table {tableInfo.tableNumber}
                        </div>
                    )}
                    <Link to="/cart" className="cart-icon-wrapper">
                        <ShoppingCart size={24} />
                        {cartItemCount > 0 && (
                            <span className="cart-badge">{cartItemCount}</span>
                        )}
                    </Link>
                </div>
            </header>
            
            <main className="customer-main">
                <Outlet />
            </main>
        </div>
    );
};

export default CustomerLayout;

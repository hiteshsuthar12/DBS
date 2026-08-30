import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, LogOut } from 'lucide-react';
import './AdminLayout.css';

const ChefLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Kitchen Display</h2>
                    <p className="user-name">Chef {user?.name}</p>
                </div>
                
                <nav className="sidebar-nav">
                    <Link to="/chef/dashboard" className={`nav-item ${isActive('dashboard')}`}>
                        <ChefHat size={20} /> Orders Board
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default ChefLayout;

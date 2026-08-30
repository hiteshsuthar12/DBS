import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UtensilsCrossed, Grid2X2, LogOut } from 'lucide-react';
import './AdminLayout.css'; // Shared CSS for Manager/Chef layouts

const ManagerLayout = () => {
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
                    <h2>Manager Panel</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                
                <nav className="sidebar-nav">
                    <Link to="/manager/dashboard" className={`nav-item ${isActive('dashboard')}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/manager/menu" className={`nav-item ${isActive('menu')}`}>
                        <UtensilsCrossed size={20} /> Menu Management
                    </Link>
                    <Link to="/manager/tables" className={`nav-item ${isActive('tables')}`}>
                        <Grid2X2 size={20} /> Table Management
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

export default ManagerLayout;

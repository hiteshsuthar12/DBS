import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/orders');
                if (res.data.success) {
                    setOrders(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loader" style={{margin: '3rem auto'}}></div>;

    // Calculate metrics for today
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const completedOrders = todaysOrders.filter(o => o.status === 'DELIVERED');
    
    const todaysRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = todaysOrders.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length;

    const kpis = [
        { title: "Today's Revenue", value: `₹${todaysRevenue.toFixed(2)}`, icon: <IndianRupee size={24} />, color: 'var(--success)' },
        { title: "Today's Orders", value: todaysOrders.length, icon: <ShoppingBag size={24} />, color: 'var(--primary-color)' },
        { title: "Active Orders", value: activeOrders, icon: <Clock size={24} />, color: 'var(--warning)' },
        { title: "Completed Orders", value: completedOrders.length, icon: <CheckCircle size={24} />, color: 'var(--text-main)' }
    ];

    return (
        <div className="manager-dashboard">
            <h2 className="page-title">Dashboard Overview</h2>
            
            <div className="kpi-grid">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="kpi-card card">
                        <div className="kpi-icon" style={{color: kpi.color, backgroundColor: `${kpi.color}20`}}>
                            {kpi.icon}
                        </div>
                        <div className="kpi-details">
                            <p className="kpi-title">{kpi.title}</p>
                            <h3 className="kpi-value">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <div className="card recent-orders-card">
                    <h3 className="card-title">Recent Orders</h3>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Table</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 10).map(order => (
                                    <tr key={order._id}>
                                        <td style={{fontWeight: 600}}>{order.orderNumber}</td>
                                        <td>{order.table?.tableNumber || '?'}</td>
                                        <td>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                        <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                        <td>₹{order.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;

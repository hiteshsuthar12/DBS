import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import './ChefDashboard.css';

const ChefDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders');
            if (res.data.success) {
                setOrders(res.data.data.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status)));
            }
        } catch (error) {
            console.error("Failed to fetch orders for chef", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        socket.emit('join_kitchen');

        const handleNewOrder = (order) => {
            setOrders(prev => [order, ...prev]);
        };

        const handleStatusUpdate = (updatedOrder) => {
            setOrders(prev => {
                if (['DELIVERED', 'CANCELLED'].includes(updatedOrder.status)) {
                    return prev.filter(o => o._id !== updatedOrder._id);
                }
                const exists = prev.find(o => o._id === updatedOrder._id);
                if (exists) {
                    return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                }
                return [...prev, updatedOrder];
            });
        };

        socket.on('order:new', handleNewOrder);
        socket.on('order:statusUpdate', handleStatusUpdate);

        return () => {
            socket.off('order:new', handleNewOrder);
            socket.off('order:statusUpdate', handleStatusUpdate);
        };
    }, [socket]);

    const changeStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            if(res.data.success){
                // Handled by socket broadcast, but optimistic update is good
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) return <div className="loader" style={{margin: '3rem auto'}}></div>;

    const pending = orders.filter(o => o.status === 'PENDING');
    const preparing = orders.filter(o => o.status === 'PREPARING');
    const ready = orders.filter(o => o.status === 'READY');

    const renderColumn = (title, columnOrders, nextStatus, nextLabel, btnClass) => (
        <div className="kanban-col">
            <div className="kanban-header">
                <h3>{title}</h3>
                <span className="kanban-count">{columnOrders.length}</span>
            </div>
            <div className="kanban-body">
                {columnOrders.map(order => (
                    <div key={order._id} className="order-card card">
                        <div className="order-card-header">
                            <span className="order-number">{order.orderNumber}</span>
                            <span className="order-table">T {order.table?.tableNumber || '?'}</span>
                        </div>
                        <div className="order-time">
                            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <ul className="order-items-list">
                            {order.items.map(item => (
                                <li key={item._id}>
                                    <span className="qty">{item.quantity}x</span> {item.name}
                                </li>
                            ))}
                        </ul>
                        {nextStatus && (
                            <button 
                                className={`btn-primary ${btnClass}`}
                                onClick={() => changeStatus(order._id, nextStatus)}
                                style={{width: '100%', marginTop: '1rem'}}
                            >
                                {nextLabel}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="chef-dashboard">
            <div className="kanban-board">
                {renderColumn('Pending', pending, 'PREPARING', 'Start Preparing', 'btn-prepare')}
                {renderColumn('Preparing', preparing, 'READY', 'Mark Ready', 'btn-ready')}
                {renderColumn('Ready', ready, 'DELIVERED', 'Mark Delivered', 'btn-deliver')}
            </div>
        </div>
    );
};

export default ChefDashboard;

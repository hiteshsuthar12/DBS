import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import './OrderTracking.css';

const OrderTracking = () => {
    const { id } = useParams();
    const socket = useSocket();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/orders/${id}`);
            if(res.data.success){
                setOrder(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        if (!socket || !order) return;

        socket.emit('join_order', order._id);

        const handleStatusUpdate = (updatedOrder) => {
            if(updatedOrder._id === order._id) {
                setOrder(updatedOrder);
            }
        };

        socket.on('order:statusUpdate', handleStatusUpdate);

        // Re-fetch on reconnect to ensure no missed updates
        const handleReconnect = () => {
            socket.emit('join_order', order._id);
            fetchOrder();
        };
        socket.on('connect', handleReconnect);

        return () => {
            socket.off('order:statusUpdate', handleStatusUpdate);
            socket.off('connect', handleReconnect);
        };
    }, [socket, order?._id]);

    if (loading) return <div className="container" style={{textAlign: 'center', marginTop: '3rem'}}><div className="loader"></div></div>;
    if (!order) return <div className="container" style={{textAlign: 'center', marginTop: '3rem'}}>Order not found.</div>;

    const statuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <div className="container order-tracking">
            <div className="card tracking-card">
                <div className="tracking-header">
                    <h2>{order.orderNumber}</h2>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                
                <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Table {order.table?.tableNumber}</p>

                {order.status === 'CANCELLED' ? (
                    <div className="alert-warning" style={{background: '#fee2e2', color: '#b91c1c', borderLeftColor: '#ef4444'}}>
                        This order has been cancelled.
                    </div>
                ) : (
                    <div className="tracking-steps">
                        {statuses.map((status, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;
                            return (
                                <div key={status} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    <div className="step-circle">
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <div className="step-label">
                                        {status === 'PENDING' && 'Order Received'}
                                        {status === 'PREPARING' && 'Preparing'}
                                        {status === 'READY' && 'Ready to Serve'}
                                        {status === 'DELIVERED' && 'Delivered'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="order-details-box">
                    <h3>Order Details</h3>
                    <div className="details-list">
                        {order.items.map(item => (
                            <div key={item._id} className="detail-item">
                                <span>{item.quantity}x {item.name}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="details-total">
                        <span>Total Paid</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, QrCode, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const ManageTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const qrRef = useRef();

    const [formData, setFormData] = useState({ tableNumber: '', capacity: '' });

    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables');
            if (res.data.success) {
                setTables(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching tables", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/tables', formData);
            fetchTables();
            setShowModal(false);
            setFormData({ tableNumber: '', capacity: '' });
        } catch (error) {
            console.error("Error creating table", error);
            alert("Failed to create table. " + (error.response?.data?.message || ''));
        }
    };

    const toggleStatus = async (table) => {
        try {
            const newStatus = table.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await axios.put(`/tables/${table._id}`, { ...table, status: newStatus });
            fetchTables();
        } catch (error) {
            console.error("Error updating table", error);
        }
    };

    const handleViewQr = (table) => {
        setSelectedTable(table);
        setShowQrModal(true);
    };

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Table_${selectedTable.tableNumber}_QR.png`;
        link.href = url;
        link.click();
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 className="page-title" style={{marginBottom: 0}}>Table & QR Management</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Add Table
                </button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Table Number</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table._id}>
                                    <td style={{fontWeight: 600}}>Table {table.tableNumber}</td>
                                    <td>{table.capacity} Persons</td>
                                    <td>
                                        <span className={`badge ${table.status === 'ACTIVE' ? 'badge-ready' : 'badge-cancelled'}`}>
                                            {table.status}
                                        </span>
                                    </td>
                                    <td style={{display: 'flex', gap: '0.5rem'}}>
                                        <button 
                                            className="btn-secondary" 
                                            style={{padding: '0.25rem 0.5rem', fontSize: '0.875rem'}}
                                            onClick={() => toggleStatus(table)}
                                        >
                                            Toggle Status
                                        </button>
                                        <button 
                                            className="btn-primary" 
                                            style={{padding: '0.25rem 0.5rem', fontSize: '0.875rem'}}
                                            onClick={() => handleViewQr(table)}
                                        >
                                            <QrCode size={16} /> View QR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Table Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{width: '100%', maxWidth: '400px', padding: '2rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                            <h3>Add Table</h3>
                            <button onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div>
                                <label>Table Number</label>
                                <input type="text" className="input-field" value={formData.tableNumber} onChange={e => setFormData({...formData, tableNumber: e.target.value})} required />
                            </div>
                            <div>
                                <label>Capacity (Persons)</label>
                                <input type="number" className="input-field" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required min="1" />
                            </div>
                            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Save Table</button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && selectedTable && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                            <h3>Table {selectedTable.tableNumber} QR Code</h3>
                            <button onClick={() => setShowQrModal(false)}><X /></button>
                        </div>
                        
                        <div ref={qrRef} style={{background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '8px', marginBottom: '1.5rem'}}>
                            <QRCodeCanvas 
                                value={`${window.location.origin}/table/${selectedTable.qrToken}`}
                                size={200}
                                level={"H"}
                            />
                        </div>
                        
                        <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', wordBreak: 'break-all'}}>
                            {window.location.origin}/table/{selectedTable.qrToken}
                        </p>

                        <button className="btn-primary" onClick={downloadQR} style={{width: '100%'}}>
                            <Download size={18} /> Download QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTables;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Check, X } from 'lucide-react';
import './ManagerDashboard.css';

const ManageMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', category: '', image: '', isAvailable: true, isActive: true
    });

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                axios.get('/menu'),
                axios.get('/menu/categories')
            ]);
            setMenuItems(menuRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/menu', formData);
            fetchData();
            setShowModal(false);
            setFormData({ name: '', description: '', price: '', category: '', image: '', isAvailable: true, isActive: true });
        } catch (error) {
            console.error("Error creating item", error);
            alert("Failed to create item");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/menu/categories', { name: newCategoryName });
            fetchData();
            setShowCategoryModal(false);
            setNewCategoryName('');
        } catch (error) {
            console.error("Error creating category", error);
            alert("Failed to create category");
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await axios.put(`/menu/${item._id}`, { ...item, isAvailable: !item.isAvailable, category: item.category._id });
            fetchData();
        } catch (error) {
            console.error("Error updating", error);
        }
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 className="page-title" style={{marginBottom: 0}}>Menu Management</h2>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="btn-secondary" onClick={() => setShowCategoryModal(true)}>
                        <Plus size={20} /> Add Category
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> Add Item
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map(item => (
                                <tr key={item._id}>
                                    <td style={{fontWeight: 500}}>{item.name}</td>
                                    <td>{item.category?.name || 'N/A'}</td>
                                    <td>₹{item.price}</td>
                                    <td>
                                        <span className={`badge ${item.isAvailable ? 'badge-ready' : 'badge-cancelled'}`}>
                                            {item.isAvailable ? 'Available' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-secondary" 
                                            style={{padding: '0.25rem 0.5rem', fontSize: '0.875rem'}}
                                            onClick={() => toggleAvailability(item)}
                                        >
                                            {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{width: '100%', maxWidth: '400px', padding: '2rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                            <h3>Add New Category</h3>
                            <button onClick={() => setShowCategoryModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleAddCategory} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div>
                                <label>Category Name</label>
                                <input type="text" className="input-field" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Save Category</button>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{width: '100%', maxWidth: '500px', padding: '2rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                            <h3>Add Menu Item</h3>
                            <button onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div>
                                <label>Name</label>
                                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div>
                                <label>Description</label>
                                <input type="text" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div>
                                <label>Price (₹)</label>
                                <input type="number" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required min="0" />
                            </div>
                            <div>
                                <label>Image URL</label>
                                <input type="url" className="input-field" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                            </div>
                            <div>
                                <label>Category</label>
                                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Save Item</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;

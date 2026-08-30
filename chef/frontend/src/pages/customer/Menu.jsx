import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';
import './Menu.css';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const [menuRes, catRes] = await Promise.all([
                    axios.get('/menu'),
                    axios.get('/menu/categories')
                ]);
                
                if (menuRes.data.success) setMenuItems(menuRes.data.data);
                if (catRes.data.success) setCategories(catRes.data.data);
            } catch (err) {
                console.error("Failed to fetch menu");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category?.name === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return <div className="menu-loading"><div className="loader"></div></div>;
    }

    return (
        <div className="menu-container container">
            <div className="menu-filters">
                <input 
                    type="text" 
                    placeholder="Search menu..." 
                    className="input-field search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="category-scroll">
                    <button 
                        className={`category-pill ${activeCategory === 'All' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('All')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat._id} 
                            className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="menu-grid">
                {filteredItems.map(item => (
                    <div key={item._id} className={`menu-card card ${!item.isAvailable ? 'unavailable' : ''}`}>
                        {item.image && (
                            <div className="menu-img-wrapper">
                                <img src={item.image} alt={item.name} loading="lazy" />
                            </div>
                        )}
                        <div className="menu-card-content">
                            <div className="menu-card-header">
                                <h3>{item.name}</h3>
                                <span className="menu-price">₹{item.price}</span>
                            </div>
                            <p className="menu-desc">{item.description}</p>
                            
                            <div className="menu-card-actions">
                                {item.isAvailable ? (
                                    <button 
                                        className="btn-primary add-to-cart-btn"
                                        onClick={() => addToCart(item)}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                ) : (
                                    <span className="badge badge-cancelled">Sold Out</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredItems.length === 0 && (
                <div className="no-items">
                    <p>No items found.</p>
                </div>
            )}
        </div>
    );
};

export default Menu;

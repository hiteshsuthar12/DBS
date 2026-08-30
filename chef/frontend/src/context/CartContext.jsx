import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    
    // Store table info
    const [tableInfo, setTableInfo] = useState(() => {
        const saved = localStorage.getItem('tableInfo');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);
    
    useEffect(() => {
        if(tableInfo) {
            localStorage.setItem('tableInfo', JSON.stringify(tableInfo));
        } else {
            localStorage.removeItem('tableInfo');
        }
    }, [tableInfo]);

    const addToCart = (item, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            tableInfo,
            setTableInfo
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);

    const addItem = (product) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.id === product.id
                        ? { ...i, qty: i.qty + (product.qty ?? 1) }
                        : i
                );
            }
            return [...prev, { ...product, qty: product.qty ?? 1 }];
        });
        setOpen(true);
    };

    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

    const updateQty = (id, delta) => {
        setItems(prev =>
            prev
                .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
                .filter(i => i.qty > 0)
        );
    };

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = items.reduce((sum, i) => sum + i.qty, 0);

    return (
        <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, total, count }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

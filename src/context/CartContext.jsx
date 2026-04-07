import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const stockLimit = product.stock ?? Infinity; // Default to Infinity if stock is missing
      const requestedQty = product.qty ?? 1;

      if (existing) {
        return prev.map((i) => {
          if (i.id === product.id) {
            const newQty = Math.min(i.qty + requestedQty, stockLimit);
            return { ...i, qty: newQty };
          }
          return i;
        });
      }

      const initialQty = Math.min(requestedQty, stockLimit);
      if (initialQty > 0) {
        return [...prev, { ...product, qty: initialQty }];
      }
      return prev;
    });
    setOpen(true);
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const stockLimit = i.stock ?? Infinity;
            const newQty = Math.max(0, Math.min(i.qty + delta, stockLimit));
            return { ...i, qty: newQty };
          }
          return i;
        })
        .filter((i) => i.qty > 0),
    );
  };

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const CartSidebar = () => {
    const { items, open, setOpen, removeItem, updateQty, total } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`cart-backdrop${open ? ' cart-backdrop--visible' : ''}`}
                onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <aside className={`cart-sidebar${open ? ' cart-sidebar--open' : ''}`}>
                {/* Header */}
                <div className="cart-sidebar__header">
                    <h2 className="cart-sidebar__title">Your Cart</h2>
                    <button
                        className="cart-sidebar__close"
                        onClick={() => setOpen(false)}
                        aria-label="Close cart"
                    >
                        ✕
                    </button>
                </div>

                {/* Items */}
                <div className="cart-sidebar__body">
                    {items.length === 0 ? (
                        <div className="cart-sidebar__empty">
                            <p>Your cart is empty.</p>
                            <button
                                className="cart-sidebar__browse-btn"
                                onClick={() => setOpen(false)}
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <ul className="cart-sidebar__list">
                            {items.map(item => (
                                <li key={item.id} className="cart-item">
                                    <div className="cart-item__image">
                                        {item.image_url && (
                                            <img src={item.image_url} alt={item.name} />
                                        )}
                                    </div>
                                    <div className="cart-item__info">
                                        <p className="cart-item__category">{item.category}</p>
                                        <p className="cart-item__name">{item.name}</p>
                                        <p className="cart-item__price">₱{(item.price * item.qty).toFixed(2)}</p>
                                        <div className="cart-item__controls">
                                            <div className="cart-qty">
                                                <button onClick={() => updateQty(item.id, -1)}>−</button>
                                                <span>{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.id, 1)}
                                                    disabled={item.stock !== undefined && item.qty >= item.stock}
                                                    style={{ opacity: item.stock !== undefined && item.qty >= item.stock ? 0.5 : 1, cursor: item.stock !== undefined && item.qty >= item.stock ? 'not-allowed' : 'pointer' }}
                                                    title={item.stock !== undefined && item.qty >= item.stock ? 'Max stock reached' : ''}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="cart-item__remove"
                                                onClick={() => removeItem(item.id)}
                                                aria-label="Remove item"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="cart-sidebar__footer">
                        <div className="cart-sidebar__total">
                            <span>Estimated Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                        <Link
                            to="/order-forms"
                            className="cart-sidebar__checkout-btn"
                            onClick={() => setOpen(false)}
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
};

export default CartSidebar;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import './PageStyles.css';

const SuccessPage = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();

    useEffect(() => {
        // Optionally clear cart again just to be safe
        clearCart();
        // Clean up URL if it has parameters
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [clearCart]);

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Success</p>
                    <h1 className="page__title">Payment Successful!</h1>
                    <p className="page__subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        Thank you for your purchase! We have successfully received your order and payment.
                        We will process your items shortly.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            className="page__cta-btn"
                            onClick={() => navigate('/products')}
                        >
                            Continue Shopping
                        </button>
                        <button
                            className="pre-footer__btn"
                            onClick={() => navigate('/purchases')}
                        >
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SuccessPage;

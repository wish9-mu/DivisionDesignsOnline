import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './PageStyles.css';

const CancelPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return (
        <Layout>
            <div className="page">
                <div className="page__header" style={{ color: '#eb4034' }}>
                    <p className="page__eyebrow" style={{ color: '#eb4034' }}>Cancelled</p>
                    <h1 className="page__title" style={{ color: '#eb4034' }}>Payment Cancelled</h1>
                    <p className="page__subtitle" style={{ maxWidth: '600px', margin: '0 auto', color: '#000' }}>
                        It looks like your payment was cancelled or failed to process.
                        Don't worry, your cart is still saved! You can try again or choose a different payment method.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            className="page__cta-btn"
                            onClick={() => navigate('/order-forms')}
                        >
                            Try Again
                        </button>
                        <button
                            className="pre-footer__btn"
                            onClick={() => navigate('/products')}
                        >
                            Return to Shop
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CancelPage;

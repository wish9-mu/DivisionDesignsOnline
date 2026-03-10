import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import './PageStyles.css';

const CancelPage = () => {
    const navigate = useNavigate();
    const [updating, setUpdating] = useState(true);

    useEffect(() => {
        const markCancelled = async () => {
            // Read order_code from URL query params (?order_code=ORD-XXXX-XXXXXX)
            const params = new URLSearchParams(window.location.search);
            const orderCode = params.get('order_code');

            if (orderCode) {
                try {
                    // Only update if still Pending (safety guard against double-updates)
                    await supabase
                        .from('orders')
                        .update({ status: 'Cancelled' })
                        .eq('order_code', orderCode)
                        .eq('status', 'Pending'); // only cancel if still pending

                    console.log(`Order ${orderCode} marked as Cancelled from CancelPage.`);
                } catch (err) {
                    console.error('Failed to cancel order:', err);
                }
            }

            // Clean up URL query params
            if (window.location.search) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            setUpdating(false);
        };

        markCancelled();
    }, []);

    return (
        <Layout>
            <div className="page">
                <div className="page__header" style={{ color: '#eb4034' }}>
                    <p className="page__eyebrow" style={{ color: '#eb4034' }}>Cancelled</p>
                    <h1 className="page__title" style={{ color: '#eb4034' }}>Payment Cancelled</h1>
                    <p className="page__subtitle" style={{ maxWidth: '600px', margin: '0 auto', color: '#000' }}>
                        It looks like your payment was cancelled or failed to process.
                        Don't worry — you can try again or choose a different payment method.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            className="page__cta-btn"
                            onClick={() => navigate('/order-forms')}
                            disabled={updating}
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

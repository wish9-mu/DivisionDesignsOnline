import React, { useState } from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

const CustomOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('Submit Request');
    const [trackId, setTrackId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Custom</p>
                    <h1 className="page__title">Custom Orders</h1>
                    <p className="page__subtitle">Design your own lanyard — we'll bring it to life.</p>
                </div>

                <div className="page__tabs">
                    {['Submit Request', 'Track Status'].map(tab => (
                        <button
                            key={tab}
                            className={`page__tab${activeTab === tab ? ' page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Submit Request' && (
                    <form className="custom-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Organization / Name</label>
                                <input type="text" placeholder="e.g. Mapua University" required />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input type="email" placeholder="you@email.com" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" min="1" placeholder="e.g. 50" required />
                            </div>
                            <div className="form-group">
                                <label>Material Type</label>
                                <select>
                                    <option>Polyester</option>
                                    <option>Polycotton</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Lanyard Size</label>
                                <select>
                                    <option>1/2 inch</option>
                                    <option>3/4 inch</option>
                                    <option>1 inch</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Print Type</label>
                                <select>
                                    <option>Back to Back</option>
                                    <option>One Side</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Design Description</label>
                            <textarea rows="4" placeholder="Describe your design, colors, logo placement, text..." required />
                        </div>
                        <div className="form-group">
                            <label>Reference Files (optional)</label>
                            <input type="file" accept="image/*,.pdf" />
                        </div>
                        <button
                            type="submit"
                            className={`page__cta-btn${submitted ? ' page__cta-btn--success' : ''}`}
                        >
                            {submitted ? '✓ Request Sent!' : 'Submit Request'}
                        </button>
                    </form>
                )}

                {activeTab === 'Track Status' && (
                    <div className="track-status">
                        <div className="form-group" style={{ maxWidth: 480, margin: '0 auto' }}>
                            <label>Order / Reference ID</label>
                            <div className="track-row">
                                <input
                                    type="text"
                                    placeholder="e.g. DD-2024-0012"
                                    value={trackId}
                                    onChange={e => setTrackId(e.target.value)}
                                />
                                <button className="page__cta-btn" onClick={() => { }}>Track</button>
                            </div>
                        </div>
                        <div className="track-empty">
                            <p>Enter your reference ID to check the status of your custom order.</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CustomOrdersPage;

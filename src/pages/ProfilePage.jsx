import React, { useState } from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('My Profile');
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Account</p>
                    <h1 className="page__title">Profile</h1>
                    <p className="page__subtitle">Manage your account and preferences.</p>
                </div>

                <div className="page__tabs">
                    {['My Profile', 'Edit Profile'].map(tab => (
                        <button
                            key={tab}
                            className={`page__tab${activeTab === tab ? ' page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'My Profile' && (
                    <div className="profile-view">
                        <div className="profile-avatar">
                            <div className="profile-avatar__circle">DD</div>
                        </div>
                        <div className="profile-details">
                            <div className="profile-detail-card">
                                <div className="profile-row">
                                    <span className="profile-label">Name</span>
                                    <span className="profile-value">Juan Dela Cruz</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Email</span>
                                    <span className="profile-value">juan@email.com</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Contact</span>
                                    <span className="profile-value">+63 9XX XXX XXXX</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Member Since</span>
                                    <span className="profile-value">March 2024</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Total Orders</span>
                                    <span className="profile-value">3</span>
                                </div>
                            </div>
                            <button
                                className="page__cta-btn"
                                onClick={() => setActiveTab('Edit Profile')}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'Edit Profile' && (
                    <form className="custom-form" onSubmit={handleSave}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" defaultValue="Juan Dela Cruz" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" defaultValue="juan@email.com" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input type="tel" defaultValue="+63 9XX XXX XXXX" />
                            </div>
                            <div className="form-group">
                                <label>Organization</label>
                                <input type="text" placeholder="Your school or org" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Delivery Address</label>
                            <input type="text" placeholder="Street, City, Province" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="Leave blank to keep current" />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" placeholder="Repeat new password" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`page__cta-btn${saved ? ' page__cta-btn--success' : ''}`}
                        >
                            {saved ? '✓ Saved!' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default ProfilePage;

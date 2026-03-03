import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import logo from '../assets/DD LOGO.png';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const passwordsMatch = form.password === form.confirm || form.confirm === '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordsMatch) return;
        setErrorMsg(null);
        setLoadingSubmit(true);
        try {
            const { data, error } = await signUp(form.email, form.password);
            setLoadingSubmit(false);
            if (error) {
                setErrorMsg(error.message || 'Signup failed');
                return;
            }
            navigate('/');
        } catch (err) {
            setLoadingSubmit(false);
            setErrorMsg(err.message || 'An unexpected error occurred');
        }
    };

    return (
        <div className="auth-split">
            {/* Left: brand panel */}
            <div className="auth-brand">
                <div className="auth-brand__inner">
                    <Link to="/" className="auth-brand__logo-wrap">
                        <img src={logo} alt="Division Designs" className="auth-brand__logo" />
                    </Link>
                    <h2 className="auth-brand__headline">Join the<br />Vision.</h2>
                    <p className="auth-brand__body">
                        Create your account to place custom orders, track deliveries, and get member-exclusive offers.
                    </p>
                    <div className="auth-brand__switch">
                        <span>Already have an account?</span>
                        <Link to="/sign-in" className="auth-brand__switch-link">Sign in →</Link>
                    </div>
                </div>
            </div>

            {/* Right: form panel */}
            <div className="auth-form-panel">
                <div className="auth-form-panel__inner">
                    <h1 className="auth-form-panel__title">Sign Up</h1>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form__group">
                            <label htmlFor="name">Full Name</label>
                            <input id="name" name="name" type="text"
                                placeholder="Juan Dela Cruz"
                                value={form.name} onChange={handleChange}
                                required autoComplete="name" />
                        </div>

                        <div className="auth-form__group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email"
                                placeholder="juan@email.com"
                                value={form.email} onChange={handleChange}
                                required autoComplete="email" />
                        </div>

                        <div className="auth-form__group">
                            <label htmlFor="password">Password</label>
                            <div className="auth-form__pass-wrap">
                                <input id="password" name="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Minimum 8 characters"
                                    value={form.password} onChange={handleChange}
                                    required minLength={8} autoComplete="new-password" />
                                <button type="button" className="auth-form__eye"
                                    onClick={() => setShowPass(v => !v)}>
                                    {showPass ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        <div className="auth-form__group">
                            <label htmlFor="confirm">Confirm Password</label>
                            <input id="confirm" name="confirm"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                value={form.confirm} onChange={handleChange}
                                required autoComplete="new-password"
                                className={!passwordsMatch ? 'auth-form__input--error' : ''} />
                            {!passwordsMatch && (
                                <span className="auth-form__error">Passwords do not match</span>
                            )}
                        </div>

                        <button type="submit" className="auth-form__submit" disabled={!passwordsMatch || loadingSubmit}>
                            {loadingSubmit ? 'Creating…' : 'Create Account'}
                        </button>
                        {errorMsg && (
                            <div className="auth-form__error" role="alert">{errorMsg}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;

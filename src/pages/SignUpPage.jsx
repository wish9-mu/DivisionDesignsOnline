import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import logo from "../assets/DD LOGO.png";
import { useAuth } from "../context/AuthContext";

const SignUpPage = () => {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await signUp(form.email, form.password, {
      username: form.username,
      first_name: form.firstName,
      last_name: form.lastName,
      full_name: `${form.firstName} ${form.lastName}`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Successful signup - show confirmation message or redirect
      navigate("/profile");
    }
  };

  const passwordsMatch = form.password === form.confirm || form.confirm === "";

  return (
    <div className="auth-split">
      {/* Left: brand panel */}
      <div className="auth-brand">
        <div className="auth-brand__inner">
          <Link to="/" className="auth-brand__logo-wrap">
            <img
              src={logo}
              alt="Division Designs"
              className="auth-brand__logo"
            />
          </Link>
          <h2 className="auth-brand__headline">
            Join the
            <br />
            Vision.
          </h2>
          <p className="auth-brand__body">
            Create your account to place custom orders, track deliveries, and
            get member-exclusive offers.
          </p>
          <div className="auth-brand__switch">
            <span>Already have an account?</span>
            <Link to="/sign-in" className="auth-brand__switch-link">
              Sign in →
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
          <h1 className="auth-form-panel__title">Sign Up</h1>

          {error && <div className="auth-form__error-banner">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="juandc"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Juan"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Dela Cruz"
                value={form.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="password">Password</label>
              <div className="auth-form__pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-form__eye"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="auth-form__group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type={showPass ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={!passwordsMatch ? "auth-form__input--error" : ""}
              />
              {!passwordsMatch && (
                <span className="auth-form__error">Passwords do not match</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={!passwordsMatch || loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

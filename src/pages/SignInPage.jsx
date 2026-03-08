import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import logo from "../assets/DD LOGO.png";
import signinBg from "../assets/signin-bg.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import gsap from "gsap";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const SignInPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const brandRef = useRef(null);
  const formRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Logo heartbeat/entrance
      gsap.fromTo(logoRef.current,
        { scale: 0.5, rotation: -15, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
      );

      // Stagger brand texts
      if (brandRef.current) {
        gsap.fromTo(brandRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
        );
      }

      // Stagger form elements
      if (formRef.current) {
        gsap.fromTo(formRef.current.children,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.4 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInErr } = await signIn(form.email, form.password);

      if (signInErr) {
        setError(signInErr.message || "Sign in failed");
        return;
      }

      // Get signed-in user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        setError(userErr?.message || "Unable to load user session.");
        return;
      }

      // Fetch role from profiles (use maybeSingle to avoid crash if missing row)
      const { data: profile, error: roleErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (roleErr) {
        setError(roleErr.message || "Failed to load user role");
        return;
      }

      // Route based on role
      if (profile?.role === "admin") navigate("/admin");
      else navigate("/profile");
    } catch (err) {
      console.error("Sign in error", err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left: brand panel */}
      <div className="auth-brand auth-brand--has-bg">
        <img src={signinBg} alt="" className="auth-brand__bg" />
        <div className="auth-brand__overlay"></div>
        <div className="auth-brand__inner" ref={brandRef}>
          <Link to="/" className="auth-brand__logo-wrap">
            <img src={logo} alt="Division Designs" className="auth-brand__logo" ref={logoRef} />
          </Link>
          <h2 className="auth-brand__headline">
            Welcome
            <br />
            back.
          </h2>
          <p className="auth-brand__body">
            Sign in to manage your orders, track deliveries, and access exclusive member deals.
          </p>
          <div className="auth-brand__switch">
            <span>Don't have an account?</span>
            <Link to="/sign-up" className="auth-brand__switch-link">
              Create one →
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner" ref={formRef}>
          <h1 className="auth-form-panel__title">Sign In</h1>

          {error && <div className="auth-form__error-banner">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
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
              <div className="auth-form__label-row">
                <label htmlFor="password">Password</label>
                  <button type="button" className="auth-form__forgot" onClick={() => setShowForgot(true)}>
                    Forgot password?
                  </button>
              </div>

              <div className="auth-form__pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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

            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
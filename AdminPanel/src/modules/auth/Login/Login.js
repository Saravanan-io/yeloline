import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import './Login.css';

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoggingIn || isSuccess) return;

    setErrorMsg('');

    if (email === 'admin@yeloline.com' && password === 'admin@123') {
      setIsLoggingIn(true);

      // Brief delay to show success state + card exit animation
      setTimeout(() => {
        setIsSuccess(true);
        setIsExiting(true);
      }, 350);

      setTimeout(() => {
        login(email, password);
      }, 800);
    } else {
      setErrorMsg('Invalid credentials! Please use email: admin@yeloline.com & pass: admin@123');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-bg-accent-1" />
      <div className="login-bg-accent-2" />

      <div className={`login-card ${isExiting ? 'animating-exit' : ''}`}>
        <div className="login-header">
          <div className="login-brand-logo">YELOLINE</div>
          <h1 className="login-title">Admin Portal Login</h1>
          <p className="login-subtitle">Sign in to manage construction projects, quotes & site finances</p>
        </div>

        {errorMsg && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Admin Email Address</label>
            <div className="login-input-wrap">
              <Mail size={18} className="login-input-icon" />
              <input
                type="email"
                required
                disabled={isLoggingIn}
                className="login-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="login-input-wrap">
              <Lock size={18} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoggingIn}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <span className="login-forgot-link" onClick={() => alert("Contact Yeloline IT Support to reset admin password.")}>
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`login-btn ${isSuccess ? 'success' : ''}`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 size={18} /> Access Granted! Redirecting...
              </>
            ) : isLoggingIn ? (
              <>
                <Loader2 size={18} className="login-spinner" /> Authenticating...
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

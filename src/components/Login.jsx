
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Activity,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { auth } from '../firebase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!auth) {
      setError('Firebase Authentication is not configured.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (err) {
      console.error('Login failed:', err);

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <Activity size={27} strokeWidth={2.5} />
          </div>

          <div className="login-brand-text">
            <h2>CampusPulse <span>AI</span></h2>
            <p>STUDENT INTELLIGENCE</p>
          </div>
        </div>

        <div className="login-badge">
          <ShieldCheck size={15} />
          SECURE STAFF PORTAL
        </div>

        <div className="login-heading">
          <h1>Welcome back<span>.</span></h1>
          <p>Sign in to access your student success dashboard.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="staff-email">Work email</label>
            <div className="login-input-wrap">
              <Mail size={19} />
              <input
                id="staff-email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="staff-password">Password</label>
            <div className="login-input-wrap">
              <LockKeyhole size={19} />
              <input
                id="staff-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in securely'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-security">
          <ShieldCheck size={17} />
          <p>
            Authorized faculty and administrators only.
            <br />
            Student accounts are not permitted.
          </p>
        </div>

        <div className="login-footer">
          <span>© 2026 CampusPulse AI</span>
          <span>BUILT FOR STUDENT SUCCESS</span>
        </div>
      </section>
    </main>
  );
}

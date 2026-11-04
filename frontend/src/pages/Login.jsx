import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container login-page">
      <section className="login-shell">
        <aside className="login-promo">
          <span className="login-brand-lockup"><span className="nav-logo-mark">SEU</span><span>UniEventX</span></span>
          <div className="login-promo-copy">
            <span className="login-eyebrow">South Eastern University</span>
            <h1>Your campus.<br />Your moments.</h1>
            <p>Find events, save your place, and keep every ticket ready for the day.</p>
            <Link to="/events" className="login-explore-link">Explore campus events <span aria-hidden="true">→</span></Link>
          </div>
          <span className="login-promo-index">EVENTS · PEOPLE · CAMPUS</span>
        </aside>

        <section className="login-form-side">
          <div className="login-form-heading">
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in to UniEventX</h2>
            <p>Use your university account to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <label htmlFor="login-email">University email</label>
            <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="btn login-submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="login-register-prompt">New to UniEventX? <Link to="/register">Create an account</Link></p>
        </section>
      </section>
    </main>
  );
};

export default Login;
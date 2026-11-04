import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageEvents = ['Club Admin', 'Super Admin'].includes(user.role);
  const canReviewPayments = ['Finance Officer', 'Super Admin'].includes(user.role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="nav-brand">
          <span className="nav-logo-mark" aria-hidden="true">SEU</span>
          <span className="nav-brand-copy"><strong>South Eastern University</strong><small>Event Management & Ticketing</small></span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/#about">About Us</Link>
        <Link to="/contact">Contact</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="nav-dashboard-link">Dashboard</Link>
            <details className="profile-menu">
              <summary>{user.name || user.role || 'Account'}</summary>
              <div className="profile-menu-popover">
                <span>{user.role || 'Student'}</span>
                <Link to="/my-tickets">My tickets</Link>
                <Link to="/payments">Payments</Link>
                {canReviewPayments && <Link to="/payments/review">Review payments</Link>}
                {canManageEvents && <><Link to="/manage-events">Manage events</Link><Link to="/attendance">Attendance</Link></>}
                <button onClick={handleLogout}>Log out</button>
              </div>
            </details>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-login-link">Login</Link>
            <Link to="/register" className="nav-register-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
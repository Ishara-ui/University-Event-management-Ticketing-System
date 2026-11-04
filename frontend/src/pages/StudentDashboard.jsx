import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const api = 'http://localhost:5000/api';

const StudentDashboard = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const controller = new AbortController();
      const headers = { Authorization: `Bearer ${token}` };
      const results = await Promise.allSettled([
        axios.get(`${api}/bookings/my-tickets`, { headers, signal: controller.signal, timeout: 8000 }),
        axios.get(`${api}/events`, { signal: controller.signal, timeout: 8000 }),
        axios.get(`${api}/notifications`, { headers, signal: controller.signal, timeout: 8000 })
      ]);

      if (!active) return;
      const [ticketResult, eventResult, notificationResult] = results;
      if (ticketResult.status === 'fulfilled') setTickets(ticketResult.value.data);
      if (eventResult.status === 'fulfilled') {
        const now = new Date();
        setEvents(eventResult.value.data.filter((event) => new Date(event.date) >= now && event.status !== 'Cancelled').slice(0, 4));
      }
      if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value.data);

      const failures = results.filter((result) => result.status === 'rejected');
      setError(failures.length === results.length ? 'Dashboard data is unavailable. Check the backend and database connection.' : 'Some dashboard information could not be refreshed.');
      setLoading(false);
      controller.abort();
    };

    refresh();
    const intervalId = window.setInterval(refresh, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const markRead = async (notification) => {
    if (notification.readAt) return;
    try {
      await axios.patch(`${api}/notifications/${notification._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
      )));
    } catch {
      setError('Could not update notification status.');
    }
  };

  return (
    <main className="container student-dashboard">
      <header className="page-header">
        <div><span className="eyebrow">South Eastern University</span><h1>Welcome, {user.name || 'student'}</h1><p className="event-page-intro">Your tickets, campus events, and updates in one place.</p></div>
        <Link to="/events" className="btn primary-btn">Browse events</Link>
      </header>

      {error && <p className="dashboard-notice" role="status">{error}</p>}
      {loading && <p className="event-feedback">Loading your dashboard...</p>}

      <div className="student-dashboard-grid">
        <section className="panel profile-panel">
          <div className="panel-header"><h2>Profile summary</h2></div>
          <dl className="profile-details">
            <div><dt>Name</dt><dd>{user.name || '—'}</dd></div>
            <div><dt>Student ID</dt><dd>{user.studentId || 'Not provided'}</dd></div>
            <div><dt>Email</dt><dd>{user.email || '—'}</dd></div>
            <div><dt>Faculty</dt><dd>{user.faculty || 'Not provided'}</dd></div>
          </dl>
        </section>

        <section className="panel notifications-panel">
          <div className="panel-header"><h2>Notifications</h2><span className="notification-count">{notifications.filter((item) => !item.readAt).length} new</span></div>
          {notifications.length ? (
            <div className="notification-list">
              {notifications.slice(0, 6).map((notification) => (
                <button key={notification._id} type="button" className={`notification-item ${notification.readAt ? '' : 'unread'}`} onClick={() => markRead(notification)}>
                  <span>{notification.message}</span>
                  <time>{new Date(notification.createdAt).toLocaleString()}</time>
                </button>
              ))}
            </div>
          ) : <p className="empty-inline">Updates about your bookings and events will appear here.</p>}
        </section>

        <section className="panel student-tickets-panel">
          <div className="panel-header"><h2>My bookings and tickets</h2><Link to="/my-tickets" className="text-link">View all</Link></div>
          {tickets.length ? (
            <div className="student-ticket-list">
              {tickets.slice(0, 4).map((ticket) => (
                <article className="student-ticket-item" key={ticket._id}>
                  <div className="student-ticket-info">
                    <h3>{ticket.eventId?.title || 'Campus event'}</h3>
                    <p>{ticket.eventId?.venue || 'Venue to be announced'} · {ticket.eventId?.date ? new Date(ticket.eventId.date).toLocaleDateString() : ''}</p>
                    <span className="ticket-code">{ticket.ticketCode || ticket._id}</span>
                  </div>
                  <div className="student-ticket-actions">
                    <span className={`status-badge ${(ticket.status || 'Active').toLowerCase()}`}>{ticket.status || 'Active'}</span>
                    {ticket.qrCode && <a className="btn muted-btn" href={ticket.qrCode} download={`${ticket.ticketCode || ticket._id}.png`}>Download QR</a>}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="empty-inline">You have no bookings yet. Browse events to find your next campus activity.</p>}
        </section>

        <section className="panel upcoming-panel">
          <div className="panel-header"><h2>Upcoming events</h2><Link to="/events" className="text-link">Explore all</Link></div>
          {events.length ? (
            <div className="upcoming-event-list">
              {events.map((event) => (
                <Link to={`/events/${event._id}`} className="upcoming-event-item" key={event._id}>
                  <span className="event-date-chip">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span><strong>{event.title}</strong><small>{event.category} · {event.venue}</small></span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          ) : <p className="empty-inline">No upcoming campus events are published right now.</p>}
        </section>
      </div>
    </main>
  );
};

export default StudentDashboard;
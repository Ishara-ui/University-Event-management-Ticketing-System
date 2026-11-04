import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageEvents = ['Club Admin', 'Super Admin'].includes(user.role);
  const canReviewPayments = ['Finance Officer', 'Super Admin'].includes(user.role);
  const canViewStaffDashboard = canManageEvents || user.role === 'Finance Officer';

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    if (!token || !canViewStaffDashboard) {
      setLoading(false);
      return () => controller.abort();
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          timeout: 8000
        });
        if (active) {
          setDashboard(response.data);
          setError('');
        }
      } catch (requestError) {
        if (active && !controller.signal.aborted) setError(requestError.response?.data?.message || 'Dashboard data is unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    const refresh = setInterval(fetchStats, 30000);

    return () => {
      active = false;
      clearInterval(refresh);
      controller.abort();
    };
  }, [token, canViewStaffDashboard]);

  if (!token) {
    return <div className="container"><section className="event-empty panel"><h2>Sign in to view the dashboard</h2><Link to="/login" className="btn primary-btn">Sign in</Link></section></div>;
  }

  if (user.role === 'Student') return <StudentDashboard user={user} />;

  if (!canManageEvents && user.role !== 'Finance Officer') {
    return <div className="container"><section className="event-empty panel"><h2>Administrator access required</h2><p>Dashboard statistics are available to event managers and finance officers.</p></section></div>;
  }

  const stats = dashboard?.stats || {};
  const statCards = [
    { label: 'Total Events', value: stats.totalEvents ?? '—', tone: 'blue' },
    { label: 'Tickets Sold', value: stats.totalTicketsSold ?? '—', tone: 'green' },
    { label: 'Upcoming Events', value: stats.upcomingEvents ?? '—', tone: 'purple' },
    { label: 'Approved Revenue', value: `LKR ${(stats.approvedRevenue ?? 0).toLocaleString()}`, tone: 'amber' },
    { label: 'Payments Pending', value: stats.pendingPayments ?? '—', tone: 'green' }
  ];

  return (
    <div className="container dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Event Dashboard</h1>
        </div>
        {canManageEvents && <Link to="/create-event" className="btn primary-btn">+ New Event</Link>}
      </div>

      {loading && <p className="event-feedback">Loading dashboard...</p>}
      {!loading && error && <p className="form-error" role="alert">{error}</p>}

      <div className="stats-grid">
        {statCards.map((item) => (
          <div key={item.label} className={`stat-card ${item.tone}`}>
            <div className="stat-top"><span>{item.label}</span></div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Upcoming Events</h3>
            {canManageEvents && <Link to="/manage-events" className="btn small-btn muted-btn">View all</Link>}
          </div>

          <div className="list-wrap">
            {(dashboard?.upcomingEvents || []).map((event) => (
              <div key={event._id} className="list-item">
                <div>
                  <h4>{event.title}</h4>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <span className={`status-badge ${(event.status || 'Published').toLowerCase()}`}>
                  {event.status || 'Published'}
                </span>
              </div>
            ))}
            {!loading && !error && !dashboard?.upcomingEvents?.length && <p className="event-feedback">No upcoming events.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>

          <div className="quick-actions">
            {canManageEvents && <Link to="/manage-events" className="action-card fill-blue"><span>Manage Events</span><small>{stats.totalEvents ?? 0} events</small></Link>}
            {canManageEvents ? <Link to="/attendance" className="action-card fill-green"><span>Attendance</span><small>Review check-ins</small></Link> : <Link to="/my-tickets" className="action-card fill-green"><span>Ticket Check-in</span><small>View ticket QR codes</small></Link>}
            {canReviewPayments ? <Link to="/payments/review" className="action-card fill-purple"><span>Review payments</span><small>{stats.pendingPayments ?? 0} pending</small></Link> : <Link to="/payments" className="action-card fill-purple"><span>Submit payment</span><small>Upload a transfer receipt</small></Link>}
          </div>
        </div>
      </div>

      {canManageEvents && (
        <section className="panel analytics-panel">
          <div className="panel-header"><h2>Sales and capacity</h2><Link to="/manage-events" className="text-link">Manage events</Link></div>
          <div className="event-analytics-list">
            {(dashboard?.eventAnalytics || []).map((event) => {
              const total = event.ticketsSold + event.remainingTickets;
              const fill = total ? Math.min(100, Math.round((event.ticketsSold / total) * 100)) : 0;
              return (
                <article className="analytics-event" key={event._id}>
                  <div className="analytics-event-header"><div><h3>{event.title}</h3><span>{new Date(event.date).toLocaleDateString()}</span></div><strong>{event.ticketsSold} / {event.ticketLimit} sold</strong></div>
                  <div className="capacity-track" role="img" aria-label={`${fill}% of ticket capacity sold`}><span style={{ width: `${fill}%` }} /></div>
                  <small>{event.remainingTickets} tickets remaining</small>
                </article>
              );
            })}
            {!loading && !error && !dashboard?.eventAnalytics?.length && <p className="event-feedback">No published events to report.</p>}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

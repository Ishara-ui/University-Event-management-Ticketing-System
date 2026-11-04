import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrganizerRequest = () => {
  const [request, setRequest] = useState(null);
  const [form, setForm] = useState({ requestedRole: 'Event Organizer', faculty: '', justification: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  useEffect(() => {
    if (!token || user.role !== 'Student') {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    axios.get('http://localhost:5000/api/organizer-requests/mine', {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout: 8000
    })
      .then((response) => setRequest(response.data))
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.response?.data?.message || 'Could not load your organizer request.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, user.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/organizer-requests', form, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      setRequest(response.data.request);
      setSuccess(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit the access request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return <main className="container"><section className="event-empty panel"><h2>Sign in to request organizer access</h2><Link to="/login" className="btn primary-btn">Sign in</Link></section></main>;
  }
  if (user.role !== 'Student') {
    return <main className="container"><section className="event-empty panel"><h2>Organizer access</h2><p>Your current role is {user.role || 'unknown'}.</p><Link to="/manage-events" className="btn primary-btn">Manage events</Link></section></main>;
  }

  return (
    <main className="container service-page">
      <header className="page-header"><div><span className="eyebrow">UniEventX access</span><h1>Request organizer access</h1><p className="event-page-intro">Requests are reviewed by a university administrator.</p></div><Link to="/events" className="btn muted-btn">Browse events</Link></header>
      {loading && <p className="event-feedback">Loading request status...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}
      {request ? (
        <section className="panel organizer-request-status">
          <span className={`status-badge ${request.status.toLowerCase().replace(/\s+/g, '-')}`}>{request.status}</span>
          <h2>{request.requestedRole} · {request.faculty}</h2>
          <p>{request.justification}</p>
          {request.reviewNote && <p>Review note: {request.reviewNote}</p>}
          {request.status === 'Approved' && <p>Sign out and back in to refresh your account role.</p>}
        </section>
      ) : !loading && (
        <form className="card organizer-request-form" onSubmit={handleSubmit}>
          <label>Requested role<select value={form.requestedRole} onChange={(event) => setForm({ ...form, requestedRole: event.target.value })}><option>Event Organizer</option><option>Faculty Lead</option></select></label>
          <label>Faculty or department<input value={form.faculty} onChange={(event) => setForm({ ...form, faculty: event.target.value })} required maxLength="120" /></label>
          <label>Reason for request<textarea rows="6" value={form.justification} onChange={(event) => setForm({ ...form, justification: event.target.value })} minLength="20" maxLength="3000" required placeholder="Describe the events or department activities you will manage." /></label>
          <button type="submit" className="btn primary-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for approval'}</button>
        </form>
      )}
    </main>
  );
};

export default OrganizerRequest;
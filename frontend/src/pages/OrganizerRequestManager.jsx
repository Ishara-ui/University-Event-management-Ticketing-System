import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { isPlatformAdmin } from '../utils/roles';

const OrganizerRequestManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState('');
  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/organizer-requests/pending', {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      setRequests(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load organizer requests.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && isPlatformAdmin(user.role)) fetchRequests();
  }, [token, user.role, fetchRequests]);

  const review = async (requestId, action) => {
    setReviewing(requestId);
    setError('');
    try {
      await axios.patch(`http://localhost:5000/api/organizer-requests/${requestId}/review`, { action }, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      await fetchRequests();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review this request.');
    } finally {
      setReviewing('');
    }
  };

  if (!token || !isPlatformAdmin(user.role)) {
    return <main className="container"><section className="event-empty panel"><h2>Administrator access required</h2><Link to={token ? '/dashboard' : '/login'} className="btn primary-btn">{token ? 'Dashboard' : 'Sign in'}</Link></section></main>;
  }

  return (
    <main className="container service-page">
      <header className="page-header"><div><span className="eyebrow">Platform oversight</span><h1>Organizer requests</h1><p className="event-page-intro">Review requests for event-management privileges.</p></div><button className="btn muted-btn" onClick={fetchRequests}>Refresh</button></header>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="event-feedback">Loading requests...</p> : requests.length === 0 ? (
        <section className="event-empty panel"><h2>No pending requests</h2><p>New organizer access requests will appear here.</p></section>
      ) : (
        <div className="organizer-request-list">
          {requests.map((request) => (
            <article key={request._id} className="organizer-request-card panel">
              <span className="status-badge pending">Pending</span>
              <h2>{request.userId?.name || 'Student'} · {request.requestedRole}</h2>
              <p>{request.userId?.email} · {request.faculty}</p>
              {request.userId?.studentId && <p>Student ID: {request.userId.studentId}</p>}
              <p>{request.justification}</p>
              <div className="management-actions">
                <button className="btn primary-btn" disabled={Boolean(reviewing)} onClick={() => review(request._id, 'approve')}>{reviewing === request._id ? 'Processing...' : 'Approve request'}</button>
                <button className="btn danger-btn" disabled={Boolean(reviewing)} onClick={() => review(request._id, 'reject')}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrganizerRequestManager;
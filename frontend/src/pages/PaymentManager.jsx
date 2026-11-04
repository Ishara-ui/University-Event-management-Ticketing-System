import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState('');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canReview = ['Finance Officer', 'Super Admin'].includes(user.role);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/payments/pending', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setPayments(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load pending payments.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && canReview) fetchPayments();
  }, [token, canReview, fetchPayments]);

  const review = async (paymentId, action) => {
    setReviewing(paymentId);
    setError('');
    try {
      await axios.patch(`http://localhost:5000/api/payments/${paymentId}/review`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      await fetchPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review payment.');
    } finally {
      setReviewing('');
    }
  };

  if (!token || !canReview) {
    return <main className="container"><section className="event-empty panel"><h2>Finance access required</h2><p>Only finance officers and super administrators can review payment slips.</p><Link to={token ? '/' : '/login'} className="btn primary-btn">{token ? 'Home' : 'Sign in'}</Link></section></main>;
  }

  return (
    <main className="container service-page">
      <header className="page-header">
        <div><span className="eyebrow">Finance operations</span><h1>Payment review</h1><p className="event-page-intro">Approve valid transfers to issue attendee tickets.</p></div>
        <button className="btn muted-btn" onClick={fetchPayments}>Refresh</button>
      </header>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="event-feedback">Loading payment submissions...</p> : payments.length === 0 ? (
        <section className="event-empty panel"><h2>No pending payments</h2><p>New transfer receipts will appear here for review.</p></section>
      ) : (
        <div className="payment-review-list">
          {payments.map((payment) => {
            const filename = String(payment.paymentSlip || '').split(/[\\/]/).pop();
            const slipUrl = `http://localhost:5000/uploads/${encodeURIComponent(filename)}`;
            return (
              <article className="payment-review-item panel" key={payment._id}>
                <div className="payment-review-info">
                  <span className="status-badge pending">Pending</span>
                  <h2>{payment.eventId?.title || 'Unknown event'}</h2>
                  <p>{payment.userId?.name || 'Unknown student'} · {payment.userId?.email || 'No email'}</p>
                  <p>LKR {Number(payment.amount).toLocaleString()} · Submitted {new Date(payment.createdAt).toLocaleString()}</p>
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="payment-slip-link">View receipt image</a>
                </div>
                <div className="management-actions">
                  <button className="btn primary-btn" disabled={Boolean(reviewing)} onClick={() => review(payment._id, 'approve')}>
                    {reviewing === payment._id ? 'Processing...' : 'Approve and issue ticket'}
                  </button>
                  <button className="btn danger-btn" disabled={Boolean(reviewing)} onClick={() => review(payment._id, 'reject')}>
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default PaymentManager;
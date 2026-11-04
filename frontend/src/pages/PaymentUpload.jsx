import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentUpload = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(() => searchParams.get('eventId') || '');
  const [ticketTierId, setTicketTierId] = useState(() => searchParams.get('ticketTierId') || '');
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const selectedEvent = events.find((item) => item._id === eventId);
  const selectedTier = selectedEvent?.ticketTiers?.find((tier) => tier._id === ticketTierId);
  const amount = selectedTier?.price ?? selectedEvent?.price ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      setLoading(false);
      return () => controller.abort();
    }

    axios.get('http://localhost:5000/api/events', { signal: controller.signal, timeout: 8000 })
      .then((response) => setEvents(response.data))
      .catch(() => {
        if (!controller.signal.aborted) setError('Could not load events. Make sure the backend and database are available.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Sign in before submitting a payment slip.');
      return;
    }

    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('amount', String(amount));
    if (ticketTierId) formData.append('ticketTierId', ticketTierId);
    formData.append('slip', slip);
    setSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/payments/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      setSuccess('Payment slip submitted. It is now awaiting approval.');
      setEventId('');
      setTicketTierId('');
      setSlip(null);
      event.target.reset();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Payment upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container service-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Bank transfer</span>
          <h1>Submit payment</h1>
          <p className="event-page-intro">Upload an image of your transfer receipt for an event.</p>
        </div>
        <Link to="/events" className="btn muted-btn">Browse events</Link>
      </header>

      {!token ? (
        <section className="event-empty panel">
          <h2>Sign in to submit a payment</h2>
          <p>Payment slips are attached to your student account for review.</p>
          <Link to="/login" className="btn primary-btn">Sign in</Link>
        </section>
      ) : (
        <section className="card payment-form-card">
          <h2>Payment details</h2>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}
          {loading ? <p className="event-feedback">Loading events...</p> : events.length === 0 ? (
            <div className="payment-no-events">
              <p>{error || 'There are no published events to pay for yet.'}</p>
              <Link to="/events" className="btn muted-btn">View events</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="payment-event">Event</label>
                <select id="payment-event" value={eventId} onChange={(e) => {
                  const nextEventId = e.target.value;
                  const nextEvent = events.find((item) => item._id === nextEventId);
                  setEventId(nextEventId);
                  setTicketTierId(nextEvent?.ticketTiers?.[0]?._id || '');
                }} required>
                  <option value="">Select an event</option>
                  {events.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}
                </select>
              </div>
              {selectedEvent?.ticketTiers?.length > 0 && (
                <div className="form-group">
                  <label htmlFor="payment-tier">Ticket type</label>
                  <select id="payment-tier" value={ticketTierId} onChange={(e) => setTicketTierId(e.target.value)} required>
                    {selectedEvent.ticketTiers.map((tier) => (
                      <option key={tier._id} value={tier._id} disabled={tier.availableTickets < 1}>
                        {tier.name} · LKR {tier.price} · {tier.availableTickets} left
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Amount to pay</label>
                <output className="payment-amount">LKR {Number(amount).toLocaleString()}</output>
              </div>
              {selectedEvent && amount <= 0 && <p className="form-error">This event is free. Book your ticket from its event details page.</p>}
              <div className="form-group">
                <label htmlFor="payment-slip">Transfer receipt</label>
                <input id="payment-slip" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setSlip(e.target.files?.[0] || null)} required />
              </div>
              <button type="submit" className="btn primary-btn" disabled={submitting || !eventId || amount <= 0 || !slip || (selectedEvent?.ticketTiers?.length > 0 && !ticketTierId)}>
                {submitting ? 'Submitting...' : 'Submit payment slip'}
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
};

export default PaymentUpload;
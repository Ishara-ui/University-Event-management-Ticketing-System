import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const BookTicket = ({ eventId, availableTickets, ticketTierId, price = 0, onBooked }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', { eventId, ticketTierId }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setBooked(true);
      onBooked?.(response.data.ticket);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not book this ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return <Link to="/my-tickets" className="btn secondary-btn">View check-in ticket</Link>;
  }

  if (price > 0) {
    const params = new URLSearchParams({ eventId });
    if (ticketTierId) params.set('ticketTierId', ticketTierId);
    return <Link to={`/payments?${params.toString()}`} className="btn primary-btn">Submit payment slip · LKR {price}</Link>;
  }

  return (
    <div className="booking-action">
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="btn primary-btn" onClick={handleBooking} disabled={submitting || availableTickets <= 0}>
        {submitting ? 'Booking...' : availableTickets <= 0 ? 'Sold out' : 'Book a ticket'}
      </button>
    </div>
  );
};

export default BookTicket;

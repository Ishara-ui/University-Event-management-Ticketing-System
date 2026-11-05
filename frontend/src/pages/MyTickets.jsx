import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import downloadTicketPdf from '../utils/ticketPdf';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  useEffect(() => {
    const controller = new AbortController();

    const fetchTickets = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/bookings/my-tickets', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          timeout: 8000
        });
        setTickets(response.data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError('Could not load your tickets. Please try again later.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchTickets();
    return () => controller.abort();
  }, [token]);

  return (
    <main className="container service-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Check-in pass</span>
          <h1>My tickets</h1>
          <p className="event-page-intro">Show your ticket QR code to the event team when you arrive.</p>
        </div>
        <Link to="/events" className="btn muted-btn">Browse events</Link>
      </header>

      {!token && (
        <section className="event-empty panel">
          <h2>Sign in to view your tickets</h2>
          <p>Your booked event tickets and check-in QR codes are linked to your account.</p>
          <Link to="/login" className="btn primary-btn">Sign in</Link>
        </section>
      )}
      {loading && <p className="event-feedback">Loading your tickets...</p>}
      {!loading && error && <p className="form-error" role="alert">{error}</p>}
      {!loading && token && !error && tickets.length === 0 && (
        <section className="event-empty panel">
          <h2>No tickets yet</h2>
          <p>Book a campus event to get your check-in QR code.</p>
          <Link to="/events" className="btn primary-btn">Find an event</Link>
        </section>
      )}
      {!error && tickets.length > 0 && (
        <div className="grid grid-3 ticket-grid">
          {tickets.map((ticket) => (
            <article key={ticket._id} className="ticket-card card">
              <div className="ticket-card-header">
                <span className="eyebrow">{ticket.eventId?.category || 'Campus event'}</span>
                <span className={`status-badge ${(ticket.status || 'Active').toLowerCase()}`}>
                  {ticket.status || 'Active'}
                </span>
              </div>
              <h2>{ticket.eventId?.title || 'Event ticket'}</h2>
              <p>{ticket.eventId?.venue || 'Venue to be announced'}</p>
              <p className="ticket-code">Ticket ID: {ticket.ticketCode || ticket._id}</p>
              <p>Student: {user.name || 'Student'}</p>
              <p>Price: {Number(ticket.price || 0) === 0 ? 'Free' : `LKR ${Number(ticket.price).toLocaleString()}`}</p>
              {ticket.qrCode && <img className="ticket-qr" src={ticket.qrCode} alt={`Check-in QR code for ${ticket.eventId?.title || 'event'}`} />}
              <p className="ticket-instruction">Present this code at event check-in.</p>
              <button type="button" className="btn primary-btn ticket-download-button" onClick={() => downloadTicketPdf(ticket, user.name)}>
                Download PDF ticket
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyTickets;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const downloadTicketPdf = (ticket, studentName) => {
  import('jspdf').then(({ jsPDF }) => {
  const eventTitle = ticket.eventId?.title || 'Campus event';
  const ticketId = ticket.ticketCode || ticket._id;
  const eventDate = ticket.eventId?.date ? new Date(ticket.eventId.date).toLocaleString() : 'To be announced';
  const price = Number(ticket.price || 0);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(49, 46, 129);
  pdf.rect(0, 0, pageWidth, 32, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('SOUTH EASTERN UNIVERSITY', 12, 12);
  pdf.setFontSize(7);
  pdf.text('UNIEVENTX DIGITAL TICKET', 12, 20);

  pdf.setTextColor(23, 37, 84);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(eventTitle, pageWidth - 24);
  pdf.text(titleLines, 12, 43);

  let lineY = 43 + titleLines.length * 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  const eventDetails = [
    `${ticket.eventId?.category || 'Campus event'} · ${ticket.eventId?.venue || 'Venue to be announced'}`,
    eventDate
  ];
  eventDetails.forEach((detail) => {
    const lines = pdf.splitTextToSize(detail, pageWidth - 24);
    pdf.text(lines, 12, lineY);
    lineY += lines.length * 5 + 2;
  });

  pdf.setDrawColor(199, 210, 254);
  pdf.line(12, lineY + 1, pageWidth - 12, lineY + 1);
  lineY += 9;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('STUDENT', 12, lineY);
  pdf.text('TICKET PRICE', pageWidth / 2 + 3, lineY);
  lineY += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(23, 37, 84);
  pdf.text(pdf.splitTextToSize(studentName || 'Student', pageWidth / 2 - 18), 12, lineY);
  pdf.text(price === 0 ? 'Free' : `LKR ${price.toLocaleString()}`, pageWidth / 2 + 3, lineY);
  lineY += 11;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TICKET ID', 12, lineY);
  lineY += 5;
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 48, 163);
  const ticketIdLines = pdf.splitTextToSize(ticketId, pageWidth - 24);
  pdf.text(ticketIdLines, 12, lineY);
  lineY += ticketIdLines.length * 4;

  if (/^data:image\/png;base64,/i.test(ticket.qrCode || '')) {
    const qrSize = 34;
    const qrY = Math.max(100, lineY + 4);
    pdf.addImage(ticket.qrCode, 'PNG', (pageWidth - qrSize) / 2, qrY, qrSize, qrSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Present this QR code at event check-in.', pageWidth / 2, qrY + qrSize + 6, { align: 'center' });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Show your ticket ID at event check-in.', pageWidth / 2, 130, { align: 'center' });
  }

  const safeTicketId = String(ticketId).replace(/[^a-zA-Z0-9_-]/g, '-');
  pdf.save(`SEU-ticket-${safeTicketId}.pdf`);
  }).catch((error) => {
    console.error('Could not generate ticket PDF:', error);
    window.alert('Could not generate the PDF ticket. Please try again.');
  });
};

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
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookTicket from './BookTicket';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`http://localhost:5000/api/events/${id}`, { signal: controller.signal, timeout: 8000 })
      .then((res) => {
        setEvent(res.data);
        setSelectedTierId(res.data.ticketTiers?.[0]?._id || '');
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.response?.data?.message || 'Could not load this event. Check the backend and database connection.');
      });

    return () => controller.abort();
  }, [id]);

  if (error) return <div className="container"><p className="form-error" role="alert">{error}</p></div>;
  if (!event) return <div className="container text-center">Loading event...</div>;

  return (
    <main className="container event-detail-page">
      <article className="card event-detail-card">
        <span className="eyebrow">{event.category}</span>
        <h1>{event.title}</h1>
        <div className="event-meta-row">
          <span>{event.venue}</span>
          <span>{new Date(event.date).toLocaleString()}</span>
        </div>
        <p>{event.description}</p>
        <p className="event-availability">Available tickets: {event.availableTickets} / {event.ticketLimit}</p>
        {event.ticketTiers?.length > 0 && (
          <div className="form-group event-tier-select">
            <label htmlFor="event-tier">Ticket type</label>
            <select id="event-tier" value={selectedTierId} onChange={(e) => setSelectedTierId(e.target.value)}>
              {event.ticketTiers.map((tier) => (
                <option key={tier._id} value={tier._id} disabled={tier.availableTickets < 1}>
                  {tier.name} - LKR {tier.price} ({tier.availableTickets} left)
                </option>
              ))}
            </select>
          </div>
        )}
        <BookTicket
          eventId={event._id}
          availableTickets={event.availableTickets}
          ticketTierId={selectedTierId || undefined}
          price={event.ticketTiers?.length
            ? event.ticketTiers.find((tier) => tier._id === selectedTierId)?.price || 0
            : event.price || 0}
          onBooked={() => setEvent((current) => ({ ...current, availableTickets: Math.max(0, current.availableTickets - 1) }))}
        />
      </article>
    </main>
  );
};

export default EventDetails;
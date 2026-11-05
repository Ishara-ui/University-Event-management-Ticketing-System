import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { canManageEvents as roleAllowsManaging } from '../utils/roles';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const hasFilters = Boolean(search.trim() || category || date);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageEvents = roleAllowsManaging(user.role);

  const getPriceLabel = (event) => {
    const prices = event.ticketTiers?.length
      ? event.ticketTiers.map((tier) => Number(tier.price))
      : [Number(event.price || 0)];
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    if (highestPrice === 0) return 'Free';
    return lowestPrice === highestPrice
      ? `LKR ${lowestPrice.toLocaleString()}`
      : `From LKR ${lowestPrice.toLocaleString()}`;
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await axios.get('http://localhost:5000/api/events', {
          params: { search: search.trim(), category, date: date || undefined, upcoming: date ? undefined : 'true' },
          signal: controller.signal,
          timeout: 8000
        });
        setEvents(res.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setEvents([]);
          const databaseError = String(err.response?.data?.error || '');
          if (/ssl|tls/i.test(databaseError)) {
            setError('The backend could not connect securely to MongoDB. Check the Atlas cluster status, network access allowlist, and MONGO_URI, then restart the backend.');
          } else if (err.response) {
            setError(err.response.data?.message || 'The events service returned an error. Check the backend logs.');
          } else {
            setError('Could not reach the events service. Make sure the backend and MongoDB are running.');
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchEvents();
    return () => controller.abort();
  }, [search, category, date, reloadKey]);

  return (
    <main className="event-catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <span className="catalog-kicker">South Eastern University · UniEventX</span>
          <h1>Find your next campus moment.</h1>
          <p>Browse academic, cultural, sports, and technology events happening across campus.</p>
        </div>
      </section>

      <div className="container event-page catalog-content">
      <div className="page-header event-page-header">
        <div>
          <span className="eyebrow">Event directory</span>
          <h2>Explore events</h2>
        </div>
        {canManageEvents && (
          <Link to="/create-event" className="btn primary-btn create-event-btn">
            <span aria-hidden="true">+</span> Create Event
          </Link>
        )}
      </div>

      <div className="event-toolbar catalog-toolbar">
        <label className="event-search-field">
          <span>Search events</span>
          <input
            type="search"
            placeholder="Search title, venue, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="event-category-field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Tech">Tech</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshops">Workshops</option>
          </select>
        </label>
        <label className="event-date-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        {!loading && !error && (
          <span className="event-count">{events.length} {events.length === 1 ? 'event' : 'events'}</span>
        )}
      </div>

      <div className="catalog-event-grid">
        {events.map((event) => (
          <article key={event._id} className="catalog-event-card">
            <Link to={`/events/${event._id}`} className="catalog-event-art" aria-label={`View ${event.title}`}>
              {event.banner
                ? <img src={`http://localhost:5000/uploads/${encodeURIComponent(String(event.banner).split(/[\\/]/).pop())}`} alt={event.title} loading="lazy" />
                : <div className="catalog-event-art-placeholder"><span>{event.category}</span></div>}
              <span className="catalog-event-date">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </Link>
            <div className="catalog-event-body">
              <span className="catalog-event-category">{event.category}</span>
              <h3><Link to={`/events/${event._id}`}>{event.title}</Link></h3>
              <p className="catalog-event-meta">{new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} <span>·</span> {event.venue}</p>
              <p className="catalog-event-description">{event.description?.substring(0, 115)}{event.description?.length > 115 ? '...' : ''}</p>
              <div className="catalog-event-footer">
                <strong>{getPriceLabel(event)}</strong>
                <Link to={`/events/${event._id}`} className="catalog-event-action">View details <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {loading && <div className="event-feedback">Loading events...</div>}
      {!loading && error && (
        <div className="event-empty panel">
          <h2>Events are temporarily unavailable</h2>
          <p>{error}</p>
          <button className="btn muted-btn" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="event-empty panel">
          <span className="event-empty-mark" aria-hidden="true">SEU</span>
          <h2>{hasFilters ? 'No matching events' : 'No events published yet'}</h2>
          <p>
            {hasFilters
              ? 'Try a different search or category, or clear your filters.'
              : 'Be the first to share something happening on campus.'}
          </p>
          {hasFilters ? (
              <button className="btn muted-btn" onClick={() => { setSearch(''); setCategory(''); setDate(''); }}>
              Clear filters
            </button>
          ) : (
            <Link to="/create-event" className="btn primary-btn">Create the first event</Link>
          )}
        </div>
      )}
      </div>
    </main>
  );
};

export default EventList;

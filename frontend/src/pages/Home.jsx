import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const categories = [
  { label: 'All events', value: '' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Workshops', value: 'Workshops' },
  { label: 'Culture & arts', value: 'Cultural' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Tech symposia', value: 'Tech' }
];

const getTicketPrice = (event) => {
  const prices = event.ticketTiers?.length
    ? event.ticketTiers.map((tier) => Number(tier.price))
    : [Number(event.price || 0)];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  if (highest === 0) return 'Free';
  if (lowest === highest) return `LKR ${lowest.toLocaleString()}`;
  return `From LKR ${lowest.toLocaleString()}`;
};

const getBannerUrl = (banner) => {
  if (!banner) return '';
  const filename = String(banner).split(/[\\/]/).pop();
  return `http://localhost:5000/uploads/${encodeURIComponent(filename)}`;
};

const Home = () => {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }
  const canCreateEvents = ['Club Admin', 'Super Admin'].includes(user.role);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/api/events', {
          params: { search: search.trim(), category, date: date || undefined, upcoming: date ? undefined : 'true', limit: 6 },
          signal: controller.signal,
          timeout: 8000
        });
        setEvents(response.data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setEvents([]);
          setError(requestError.response?.data?.message || 'Events are unavailable. Check the backend and database connection.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, category, date]);

  useEffect(() => {
    const controller = new AbortController();
    axios.get('http://localhost:5000/api/dashboard/public-stats', {
      signal: controller.signal,
      timeout: 8000
    })
      .then((response) => setMetrics(response.data))
      .catch(() => {
        if (!controller.signal.aborted) setMetrics(null);
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero">
        <img className="home-hero-image" src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2200&q=85" alt="University students gathered at a campus event" />
        <div className="home-hero-scrim" />
        <div className="home-hero-content">
          <span className="home-kicker">South Eastern University · Campus life</span>
          <h1>Discover, organize, and book campus events seamlessly.</h1>
          <p>Find your next campus moment, reserve a place, and keep every ticket close.</p>
          <form className="home-search" onSubmit={(event) => { event.preventDefault(); document.getElementById('upcoming-events')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <label className="home-search-query">
              <span>Search events</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Event name, category, or venue" />
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <button className="btn primary-btn" type="submit">Explore events</button>
          </form>
          <div className="home-hero-links">
            <Link to="/events">Browse all events</Link>
            <Link to="/register">Get started <span aria-hidden="true">→</span></Link>
            {canCreateEvents && <Link to="/create-event" className="home-create-event-link">+ Create Event</Link>}
          </div>
        </div>
        <span className="hero-index">01 / CAMPUS EVENTS</span>
      </section>

      <section className="impact-strip" aria-label="Platform activity">
        <div className="impact-intro"><span className="eyebrow">The campus, in motion</span><p>Real activity from across the university.</p></div>
        <div className="impact-stat"><strong>{metrics ? metrics.totalEvents.toLocaleString() : '—'}</strong><span>Events hosted</span></div>
        <div className="impact-stat"><strong>{metrics ? metrics.activeStudents.toLocaleString() : '—'}</strong><span>Student users</span></div>
        <div className="impact-stat"><strong>{metrics ? metrics.ticketsIssued.toLocaleString() : '—'}</strong><span>Tickets issued</span></div>
      </section>

      <section className="home-content-section" id="upcoming-events">
        <div className="home-section-heading">
          <div><span className="eyebrow">Make a date of it</span><h2>Upcoming events</h2></div>
          <Link to="/events" className="text-link">View event directory <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-chips" aria-label="Filter by category">
          {categories.map((item) => (
            <button type="button" className={`category-chip ${category === item.value ? 'active' : ''}`} key={item.label} onClick={() => setCategory(item.value)} aria-pressed={category === item.value}>{item.label}</button>
          ))}
        </div>
        {loading && <p className="event-feedback">Finding upcoming events...</p>}
        {!loading && error && <div className="home-events-message" role="alert"><strong>Events are temporarily unavailable</strong><span>{error}</span></div>}
        {!loading && !error && events.length === 0 && <div className="home-events-message"><strong>No matching events</strong><span>Try another keyword, category, or date.</span></div>}
        {!loading && !error && events.length > 0 && (
          <div className="home-event-grid">
            {events.map((event) => {
              const bannerUrl = getBannerUrl(event.banner);
              return (
                <article className="home-event-card" key={event._id}>
                  <Link to={`/events/${event._id}`} className="home-event-image-link" aria-label={`View ${event.title}`}>
                    {bannerUrl ? <img className="home-event-image" src={bannerUrl} alt={event.title} loading="lazy" /> : <div className="home-event-image home-event-placeholder"><span>{event.category}</span></div>}
                    <span className="home-event-date">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </Link>
                  <div className="home-event-info">
                    <span className="event-category-label">{event.category}</span>
                    <h3><Link to={`/events/${event._id}`}>{event.title}</Link></h3>
                    <p className="home-event-meta">{new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} <span>·</span> {event.venue}</p>
                    <div className="home-event-footer"><strong>{getTicketPrice(event)}</strong><div><Link to={`/events/${event._id}`} className="home-event-cta">Details</Link><Link to={`/events/${event._id}`} className="btn primary-btn home-book-btn">Book now</Link></div></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-about-band" id="about">
        <div className="home-about-mark" aria-hidden="true">SEU</div>
        <div><span className="eyebrow">One campus, many ways to connect</span><h2>Make room for what brings us together.</h2><p>From academic forums to culture, sport, and technology, find the events shaping life at South Eastern University.</p></div>
        <Link to="/events" className="btn secondary-btn">Discover campus events</Link>
      </section>

      <section className="home-contact-section" id="contact">
        <div><span className="eyebrow">Need a hand?</span><h2>Contact the university</h2><p>For event or ticket support, contact the university event office or your faculty administrator.</p></div>
        <address>South Eastern University of Sri Lanka<br />University Park, Oluvil 32360, Sri Lanka<br /><a href="https://www.seu.ac.lk/" target="_blank" rel="noreferrer">Official university website</a></address>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Link to="/" className="footer-brand"><span className="nav-logo-mark">SEU</span><span>University Event Management<br />& Ticketing System</span></Link>
          <div className="footer-links"><Link to="/">Home</Link><Link to="/events">Events</Link><Link to="/#about">About Us</Link><Link to="/contact">Contact</Link><Link to="/login">Login</Link></div>
          <div className="footer-legal"><details><summary>Privacy notice</summary><p>Account details, bookings, and submitted payment receipts are used to operate university event registration and check-in.</p></details><details><summary>Terms of use</summary><p>Event availability and changes are managed by university organizers. Tickets are subject to event capacity and the published booking requirements.</p></details></div>
        </div>
        <div className="footer-bottom"><span>South Eastern University of Sri Lanka</span><span>Copyright {new Date().getFullYear()} · Event Management & Ticketing</span></div>
      </footer>
    </main>
  );
};

export default Home;

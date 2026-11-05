import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { canManageEvents as roleAllowsManaging } from '../utils/roles';

const api = 'http://localhost:5000/api/events';

const toLocalDateTime = (date) => {
	const localDate = new Date(date);
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
	return localDate.toISOString().slice(0, 16);
};

const ManageEvents = () => {
	const [events, setEvents] = useState([]);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const token = localStorage.getItem('token');
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const canManage = roleAllowsManaging(user.role);

	const fetchEvents = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const response = await axios.get(`${api}/manage`, {
				headers: { Authorization: `Bearer ${token}` },
				timeout: 8000
			});
			setEvents(response.data);
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not load managed events.');
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		if (token && canManage) fetchEvents();
	}, [token, canManage, fetchEvents]);

	const startEditing = (event) => {
		setEditing(event._id);
		setForm({
			title: event.title,
			description: event.description,
			category: event.category,
			date: toLocalDateTime(event.date),
			venue: event.venue,
			price: event.price || 0,
			status: event.status || 'Published',
			ticketTiers: event.ticketTiers?.length
				? event.ticketTiers.map(({ name, price, capacity }) => ({ name, price, capacity }))
				: [{ name: 'General Admission', price: event.price || 0, capacity: event.ticketLimit }]
		});
		setError('');
	};

	const saveEvent = async (submitEvent) => {
		submitEvent.preventDefault();
		setSaving(true);
		setError('');
		try {
			await axios.put(`${api}/${editing}`, form, {
				headers: { Authorization: `Bearer ${token}` },
				timeout: 10000
			});
			setEditing(null);
			await fetchEvents();
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not update the event.');
		} finally {
			setSaving(false);
		}
	};

	const cancelEvent = async (id) => {
		if (!window.confirm('Cancel this event? It will no longer accept new bookings.')) return;
		try {
			await axios.patch(`${api}/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
			await fetchEvents();
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not cancel this event.');
		}
	};

	const deleteEvent = async (id) => {
		if (!window.confirm('Permanently delete this event? Events with ticket or payment history must be cancelled instead.')) return;
		try {
			await axios.delete(`${api}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
			await fetchEvents();
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not delete this event.');
		}
	};

	if (!token || !canManage) {
		return <main className="container"><section className="event-empty panel"><h2>Organizer access required</h2><p>Only club administrators and super administrators can manage events.</p><Link to={token ? '/events' : '/login'} className="btn primary-btn">{token ? 'Browse events' : 'Sign in'}</Link></section></main>;
	}

	return (
		<main className="container management-page">
			<header className="page-header">
				<div><span className="eyebrow">Organizer tools</span><h1>Manage events</h1></div>
				<Link to="/create-event" className="btn primary-btn">+ New Event</Link>
			</header>
			{error && <p className="form-error" role="alert">{error}</p>}
			{loading ? <p className="event-feedback">Loading events...</p> : events.length === 0 ? (
				<section className="event-empty panel"><h2>No events to manage</h2><Link to="/create-event" className="btn primary-btn">Create an event</Link></section>
			) : (
				<div className="management-list">
					{events.map((event) => (
						<article key={event._id} className="management-item panel">
							{editing === event._id ? (
								<form onSubmit={saveEvent} className="management-edit-form">
									<label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
									<label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
									<label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
									<label>Date and time<input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
									<label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required /></label>
									<fieldset className="tier-editor management-tier-editor">
										<legend>Ticket tiers</legend>
										{form.ticketTiers.map((tier, index) => (
											<div className="ticket-tier-row" key={`manage-tier-${index}`}>
												<label>Tier name<input value={tier.name} onChange={(e) => setForm({ ...form, ticketTiers: form.ticketTiers.map((item, tierIndex) => tierIndex === index ? { ...item, name: e.target.value } : item) })} required /></label>
												<label>Price (LKR)<input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => setForm({ ...form, ticketTiers: form.ticketTiers.map((item, tierIndex) => tierIndex === index ? { ...item, price: e.target.value } : item) })} required /></label>
												<label>Capacity<input type="number" min="1" step="1" value={tier.capacity} onChange={(e) => setForm({ ...form, ticketTiers: form.ticketTiers.map((item, tierIndex) => tierIndex === index ? { ...item, capacity: e.target.value } : item) })} required /></label>
											</div>
										))}
										<button type="button" className="btn muted-btn" onClick={() => setForm({ ...form, ticketTiers: [...form.ticketTiers, { name: '', price: '', capacity: '' }] })}>Add tier</button>
										<small>Total capacity: {form.ticketTiers.reduce((sum, tier) => sum + Number(tier.capacity || 0), 0)}</small>
									</fieldset>
									<label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Draft</option><option>Published</option><option>Cancelled</option></select></label>
									<div className="management-actions"><button className="btn primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button><button type="button" className="btn muted-btn" onClick={() => setEditing(null)}>Discard</button></div>
								</form>
							) : (
								<>
									<div className="management-event-info">
										<span className={`status-badge ${(event.status || 'Published').toLowerCase()}`}>{event.status || 'Published'}</span>
										<h2>{event.title}</h2>
										<p>{event.category} · {event.venue} · {new Date(event.date).toLocaleString()}</p>
										<p>{event.availableTickets} of {event.ticketLimit} tickets available · LKR {event.price || 0}</p>
									</div>
									<div className="management-actions">
										<button className="btn muted-btn" onClick={() => startEditing(event)}>Edit</button>
										<Link to={`/attendance?eventId=${event._id}`} className="btn muted-btn">Attendance</Link>
										{event.status !== 'Cancelled' && <button className="btn muted-btn" onClick={() => cancelEvent(event._id)}>Cancel event</button>}
										<button className="btn danger-btn" onClick={() => deleteEvent(event._id)}>Delete</button>
									</div>
								</>
							)}
						</article>
					))}
				</div>
			)}
		</main>
	);
};

export default ManageEvents;
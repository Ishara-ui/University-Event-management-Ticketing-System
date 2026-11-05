import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { canManageEvents as roleAllowsManaging, canReviewPayments as roleAllowsReviewing } from '../utils/roles';

const AttendanceList = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [events, setEvents] = useState([]);
	const [tickets, setTickets] = useState([]);
	 const [search, setSearch] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const token = localStorage.getItem('token');
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const canManage = roleAllowsManaging(user.role);
	const selectedEventId = searchParams.get('eventId') || '';
	const visibleTickets = tickets.filter((ticket) => {
		const searchText = search.trim().toLowerCase();
		return !searchText || [ticket.userId?.name, ticket.userId?.email, ticket.ticketCode]
			.some((value) => String(value || '').toLowerCase().includes(searchText));
	});

	const exportCsv = () => {
		const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
		const rows = [
			['Name', 'Email', 'Ticket ID', 'Status', 'Checked In At'],
			...visibleTickets.map((ticket) => [
				ticket.userId?.name,
				ticket.userId?.email,
				ticket.ticketCode || ticket._id,
				ticket.status,
				ticket.checkedInAt ? new Date(ticket.checkedInAt).toISOString() : ''
			])
		];
		const csv = rows.map((row) => row.map(quote).join(',')).join('\r\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'event-attendees.csv';
		link.click();
		URL.revokeObjectURL(url);
	};

	useEffect(() => {
		if (!token || !canManage) return undefined;
		const controller = new AbortController();
		axios.get('http://localhost:5000/api/events/manage', {
			headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout: 8000
		})
			.then((response) => setEvents(response.data))
			.catch((requestError) => {
				if (!controller.signal.aborted) setError(requestError.response?.data?.message || 'Could not load events.');
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [token, canManage]);

	useEffect(() => {
		if (!selectedEventId || !token || !canManage) {
			setTickets([]);
			return undefined;
		}
		const controller = new AbortController();
		setLoading(true);
		axios.get(`http://localhost:5000/api/attendance/event/${selectedEventId}`, {
			headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout: 8000
		})
			.then((response) => setTickets(response.data.tickets))
			.catch((requestError) => {
				if (!controller.signal.aborted) setError(requestError.response?.data?.message || 'Could not load attendance.');
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [selectedEventId, token, canManage]);

	if (!token || !canManage) {
		return <main className="container"><section className="event-empty panel"><h2>Organizer access required</h2><Link to={token ? '/events' : '/login'} className="btn primary-btn">{token ? 'Browse events' : 'Sign in'}</Link></section></main>;
	}

	return (
		<main className="container service-page">
			<header className="page-header">
				<div><span className="eyebrow">Event operations</span><h1>Attendance</h1><p className="event-page-intro">Review ticket holders and their check-in status.</p></div>
				<Link to="/attendance/scanner" className="btn primary-btn">Check in ticket</Link>
			</header>
			<section className="attendance-panel panel">
				<label htmlFor="attendance-event">Event</label>
				<select id="attendance-event" value={selectedEventId} onChange={(event) => setSearchParams(event.target.value ? { eventId: event.target.value } : {})}>
					<option value="">Select an event</option>
					{events.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
				</select>
			</section>
			{selectedEventId && tickets.length > 0 && (
				<div className="attendance-tools">
					<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendee, email, or ticket ID" aria-label="Search attendees" />
					<button className="btn muted-btn" onClick={exportCsv}>Export CSV ({visibleTickets.length})</button>
				</div>
			)}
			{error && <p className="form-error" role="alert">{error}</p>}
			{loading && <p className="event-feedback">Loading attendance...</p>}
			{!loading && selectedEventId && !tickets.length && !error && <section className="event-empty panel"><h2>No tickets booked</h2><p>Attendee records will appear here after ticket bookings.</p></section>}
			{!loading && visibleTickets.length > 0 && (
				<div className="attendance-table-wrap panel">
					<table className="attendance-table">
						<thead><tr><th>Attendee</th><th>Email</th><th>Ticket ID</th><th>Status</th><th>Checked in</th></tr></thead>
						<tbody>{visibleTickets.map((ticket) => (
							<tr key={ticket._id}>
								<td>{ticket.userId?.name || 'Unknown attendee'}</td>
								<td>{ticket.userId?.email || '—'}</td>
								<td>{ticket.ticketCode || ticket._id}</td>
								<td><span className={`status-badge ${(ticket.status || 'Active').toLowerCase()}`}>{ticket.status || 'Active'}</span></td>
								<td>{ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : '—'}</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			)}
			{!loading && selectedEventId && tickets.length > 0 && visibleTickets.length === 0 && <p className="event-feedback">No attendees match this search.</p>}
		</main>
	);
};

export default AttendanceList;

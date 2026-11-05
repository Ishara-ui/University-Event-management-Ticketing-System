import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { canManageEvents as roleAllowsManaging } from '../utils/roles';

const QRScanner = () => {
	const [ticketCode, setTicketCode] = useState('');
	const [result, setResult] = useState(null);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const token = localStorage.getItem('token');
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const canCheckIn = roleAllowsManaging(user.role);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setResult(null);
		setSubmitting(true);
		try {
			const response = await axios.post('http://localhost:5000/api/attendance/check-in', { ticketCode }, {
				headers: { Authorization: `Bearer ${token}` },
				timeout: 8000
			});
			setResult(response.data.ticket);
			setTicketCode('');
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not verify ticket. Check the backend connection.');
		} finally {
			setSubmitting(false);
		}
	};

	if (!token || !canCheckIn) {
		return <main className="container"><section className="event-empty panel"><h2>Organizer access required</h2><p>Only event organizers can check in attendees.</p><Link to={token ? '/events' : '/login'} className="btn primary-btn">{token ? 'Browse events' : 'Sign in'}</Link></section></main>;
	}

	return (
		<main className="container service-page">
			<header className="page-header">
				<div><span className="eyebrow">Event operations</span><h1>Attendee check-in</h1><p className="event-page-intro">Enter the unique code encoded in the attendee’s ticket QR.</p></div>
				<Link to="/attendance" className="btn muted-btn">Attendance list</Link>
			</header>
			<section className="card checkin-card">
				<form onSubmit={handleSubmit}>
					<label htmlFor="ticket-code">Ticket code</label>
					<input id="ticket-code" value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} autoComplete="off" required />
					<button type="submit" className="btn primary-btn" disabled={submitting}>{submitting ? 'Verifying...' : 'Check in attendee'}</button>
				</form>
				{error && <p className="form-error" role="alert">{error}</p>}
				{result && <div className="checkin-success" role="status"><strong>Check-in successful</strong><span>{result.eventId?.title} · {result.ticketCode}</span></div>}
			</section>
		</main>
	);
};

export default QRScanner;

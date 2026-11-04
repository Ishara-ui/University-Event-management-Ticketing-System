const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const User = require('../models/User');

const getPublicStats = async (req, res) => {
	try {
		const publishedEvents = { status: { $nin: ['Draft', 'Cancelled'] } };
		const [totalEvents, activeStudents, ticketsIssued] = await Promise.all([
			Event.countDocuments(publishedEvents),
			User.countDocuments({ role: 'Student' }),
			Ticket.countDocuments({})
		]);
		res.status(200).json({ totalEvents, activeStudents, ticketsIssued });
	} catch (error) {
		res.status(500).json({ message: 'Could not load platform statistics.' });
	}
};

const getStats = async (req, res) => {
	try {
		const eventQuery = ['Event Organizer', 'Faculty Lead', 'Club Admin'].includes(req.user.role)
			? { createdBy: req.user.id }
			: {};
		const events = await Event.find(eventQuery).select('_id title date status availableTickets ticketLimit').lean();
		const eventIds = events.map((event) => event._id);
		const paymentFilter = { eventId: { $in: eventIds } };

		const [ticketsSold, pendingPayments, approvedPayments, totalUsers] = await Promise.all([
			Ticket.countDocuments({ eventId: { $in: eventIds } }),
			Payment.countDocuments({ ...paymentFilter, status: 'Pending' }),
			Payment.aggregate([
				{ $match: { ...paymentFilter, status: 'Approved' } },
				{ $group: { _id: null, total: { $sum: '$amount' } } }
			]),
			req.user.role === 'Super Admin' ? User.countDocuments() : Promise.resolve(null)
		]);
		const ticketCounts = await Ticket.aggregate([
			{ $match: { eventId: { $in: eventIds } } },
			{ $group: { _id: '$eventId', count: { $sum: 1 } } }
		]);
		const ticketCountByEvent = new Map(ticketCounts.map((item) => [String(item._id), item.count]));
		const now = new Date();

		const upcomingEvents = events
			.filter((event) => event.date >= now && event.status !== 'Cancelled' && event.status !== 'Draft')
			.sort((left, right) => left.date - right.date)
			.slice(0, 8);
		const eventAnalytics = events
			.filter((event) => event.status !== 'Cancelled' && event.status !== 'Draft')
			.map((event) => ({
				_id: event._id,
				title: event.title,
				date: event.date,
				status: event.status || 'Published',
				ticketLimit: event.ticketLimit,
				remainingTickets: event.availableTickets,
				ticketsSold: ticketCountByEvent.get(String(event._id)) || 0
			}))
			.sort((left, right) => left.date - right.date)
			.slice(0, 8);

		res.status(200).json({
			stats: {
				totalEvents: events.length,
				publishedEvents: events.filter((event) => event.status !== 'Cancelled' && event.status !== 'Draft').length,
				totalUsers,
				totalTicketsSold: ticketsSold,
				pendingPayments,
				approvedRevenue: approvedPayments[0]?.total || 0,
				upcomingEvents: upcomingEvents.length
			},
			upcomingEvents,
			eventAnalytics
		});
	} catch (error) {
		res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
	}
};

module.exports = { getStats, getPublicStats };

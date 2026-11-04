const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

const canManageEvent = (user, event) => (
	['Admin', 'Super Admin'].includes(user.role) || String(event.createdBy) === String(user.id)
);

const getAttendance = async (req, res) => {
	try {
		const event = await Event.findById(req.params.eventId);
		if (!event) return res.status(404).json({ message: 'Event not found.' });
		if (!canManageEvent(req.user, event)) return res.status(403).json({ message: 'You can only view attendance for your events.' });

		const tickets = await Ticket.find({ eventId: event._id })
			.populate('userId', 'name email')
			.sort({ createdAt: -1 });
		res.status(200).json({ event: { id: event._id, title: event.title }, tickets });
	} catch (error) {
		res.status(500).json({ message: 'Error loading attendance', error: error.message });
	}
};

const checkIn = async (req, res) => {
	try {
		const ticketCode = String(req.body.ticketCode || '').trim();
		if (!ticketCode) return res.status(400).json({ message: 'Ticket code is required.' });

		const ticket = await Ticket.findOne({ ticketCode }).populate('eventId');
		if (!ticket) return res.status(404).json({ message: 'Ticket code was not found.' });
		if (!canManageEvent(req.user, ticket.eventId)) {
			return res.status(403).json({ message: 'You can only check in tickets for your events.' });
		}
		if (ticket.eventId.status === 'Cancelled') return res.status(409).json({ message: 'This event has been cancelled.' });
		if (ticket.status !== 'Active') return res.status(409).json({ message: `Ticket is already ${ticket.status.toLowerCase()}.` });

		const checkedInTicket = await Ticket.findOneAndUpdate(
			{ _id: ticket._id, status: 'Active' },
			{ $set: { status: 'Checked-In', checkedInAt: new Date() } },
			{ new: true }
		).populate('eventId', 'title');

		if (!checkedInTicket) return res.status(409).json({ message: 'Ticket has already been checked in.' });
		res.status(200).json({ message: 'Check-in successful.', ticket: checkedInTicket });
	} catch (error) {
		res.status(500).json({ message: 'Error checking in ticket', error: error.message });
	}
};

module.exports = { getAttendance, checkIn };

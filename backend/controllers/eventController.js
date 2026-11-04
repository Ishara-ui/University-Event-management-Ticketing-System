const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const canManageEvent = (user, event) => (
  ['Admin', 'Super Admin'].includes(user.role) || String(event.createdBy) === String(user.id)
);

const parseTicketTiers = (value) => {
  if (!value) return [];

  let tiers = value;
  if (typeof value === 'string') {
    try {
      tiers = JSON.parse(value);
    } catch {
      throw Object.assign(new Error('Ticket tiers must contain valid JSON.'), { status: 400 });
    }
  }
  if (!Array.isArray(tiers)) throw Object.assign(new Error('Ticket tiers must be a list.'), { status: 400 });

  return tiers.map((tier) => {
    const name = String(tier.name || '').trim();
    const price = Number(tier.price);
    const capacity = Number(tier.capacity);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(capacity) || capacity < 1) {
      throw Object.assign(new Error('Each ticket tier needs a name, non-negative price, and capacity of at least one.'), { status: 400 });
    }
    return { name, price, capacity, availableTickets: capacity };
  });
};

const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, venue } = req.body;
    const ticketTiers = parseTicketTiers(req.body.ticketTiers);
    const tierCapacity = ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0);
    const ticketLimit = Number(req.body.ticketLimit || tierCapacity);
    const price = Number(req.body.price || 0);

    if (!Number.isInteger(ticketLimit) || ticketLimit < 1 || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: 'Ticket capacity must be positive and price cannot be negative.' });
    }
    if (ticketTiers.length && tierCapacity !== ticketLimit) {
      return res.status(400).json({ message: 'Total ticket tier capacity must equal the event ticket limit.' });
    }

    const bannerPath = req.file ? req.file.path : '';

    const newEvent = new Event({
      title,
      description,
      category,
      date,
      venue,
      banner: bannerPath,
      price,
      ticketLimit,
      availableTickets: ticketLimit,
      ticketTiers,
      status: req.body.status === 'Draft' ? 'Draft' : 'Published',
      createdBy: req.user ? req.user.id : null
    });

    const savedEvent = await newEvent.save();
    res.status(201).json({ message: 'Event created successfully!', event: savedEvent });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Error creating event', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { category, search, date, upcoming, limit } = req.query;
    const query = { status: { $nin: ['Draft', 'Cancelled'] } };

    if (category === 'Tech') query.category = { $in: ['Tech', 'Technology'] };
    else if (category === 'Workshops') query.category = { $in: ['Workshops', 'Workshop'] };
    else if (category) query.category = category;
    if (search && search.trim()) {
      const searchPattern = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = ['title', 'description', 'category', 'venue'].map((field) => ({
        [field]: { $regex: searchPattern, $options: 'i' }
      }));
    }

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      if (Number.isNaN(start.getTime())) return res.status(400).json({ message: 'Date filter is invalid.' });
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const parsedLimit = Number.parseInt(limit, 10);
    const eventQuery = Event.find(query).sort({ date: 1 });
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) eventQuery.limit(Math.min(parsedLimit, 50));
    const events = await eventQuery;
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

const getManagedEvents = async (req, res) => {
  try {
    const query = ['Admin', 'Super Admin'].includes(req.user.role) ? {} : { createdBy: req.user.id };
    const events = await Event.find(query).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching managed events', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'Draft') return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManageEvent(req.user, event)) return res.status(403).json({ message: 'You can only manage events you created.' });

    const allowedFields = ['title', 'description', 'category', 'date', 'venue', 'price', 'status'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (req.body.ticketLimit !== undefined) {
      if (event.ticketTiers.length && req.body.ticketTiers === undefined) {
        return res.status(400).json({ message: 'Update ticket tiers to change capacity for a tiered event.' });
      }
      const ticketLimit = Number(req.body.ticketLimit);
      const soldTickets = event.ticketLimit - event.availableTickets;
      if (!Number.isInteger(ticketLimit) || ticketLimit < soldTickets) {
        return res.status(400).json({ message: 'Ticket capacity cannot be less than the number of tickets already sold.' });
      }
      updateData.ticketLimit = ticketLimit;
      updateData.availableTickets = ticketLimit - soldTickets;
    }

    if (req.body.ticketTiers !== undefined) {
      const soldTickets = await Ticket.countDocuments({ eventId: event._id });
      if (soldTickets > 0) return res.status(409).json({ message: 'Ticket tiers cannot be changed after tickets have been booked.' });
      const ticketTiers = parseTicketTiers(req.body.ticketTiers);
      const ticketLimit = ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0);
      if (!ticketLimit) return res.status(400).json({ message: 'At least one ticket tier is required.' });
      updateData.ticketTiers = ticketTiers;
      updateData.ticketLimit = ticketLimit;
      updateData.availableTickets = ticketLimit;
    }

    if (req.file) updateData.banner = req.file.path;

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    const wasCancelled = event.status !== 'Cancelled' && updatedEvent.status === 'Cancelled';
    const changedFields = ['title', 'date', 'venue'].filter((field) => (
      updateData[field] !== undefined && String(updateData[field]) !== String(event[field])
    ));
    if (wasCancelled || changedFields.length) {
      const userIds = await Ticket.distinct('userId', { eventId: event._id });
      await Notification.createForUsers(userIds, {
        eventId: event._id,
        type: wasCancelled ? 'event-cancelled' : 'event-updated',
        message: wasCancelled ? `${event.title} has been cancelled.` : `${event.title} has updated ${changedFields.join(', ')}.`
      });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Error updating event', error: error.message });
  }
};

const cancelEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });
    if (!canManageEvent(req.user, existingEvent)) return res.status(403).json({ message: 'You can only manage events you created.' });

    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const userIds = await Ticket.distinct('userId', { eventId: event._id });
    await Notification.createForUsers(userIds, {
      eventId: event._id,
      type: 'event-cancelled',
      message: `${event.title} has been cancelled.`
    });
    res.status(200).json({ message: 'Event cancelled', event });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManageEvent(req.user, event)) return res.status(403).json({ message: 'You can only manage events you created.' });

    const [ticketCount, paymentCount] = await Promise.all([
      Ticket.countDocuments({ eventId: req.params.id }),
      Payment.countDocuments({ eventId: req.params.id })
    ]);
    if (ticketCount || paymentCount) {
      return res.status(409).json({ message: 'This event has booking or payment records. Cancel it instead to preserve history.' });
    }

    await event.deleteOne();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, getManagedEvents, getEventById, updateEvent, cancelEvent, deleteEvent };

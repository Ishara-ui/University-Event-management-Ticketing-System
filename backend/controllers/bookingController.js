const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const Notification = require('../models/Notification');

const bookTicket = async (req, res) => {
  let reservedEvent;
  let selectedTierId;

  try {
    const { eventId, ticketTierId } = req.body;
    const userId = req.user.id;
    selectedTierId = ticketTierId;

    if (!eventId) return res.status(400).json({ message: 'Event ID is required.' });

    const inventoryQuery = {
      _id: eventId,
      status: { $nin: ['Draft', 'Cancelled'] },
      availableTickets: { $gt: 0 }
    };
    const inventoryUpdate = { $inc: { availableTickets: -1 } };

    if (ticketTierId) {
      inventoryQuery.ticketTiers = {
        $elemMatch: { _id: ticketTierId, availableTickets: { $gt: 0 } }
      };
      inventoryUpdate.$inc['ticketTiers.$.availableTickets'] = -1;
    }

    reservedEvent = await Event.findOneAndUpdate(inventoryQuery, inventoryUpdate, { new: true });
    if (!reservedEvent) {
      const event = await Event.findById(eventId);
      if (!event || ['Draft', 'Cancelled'].includes(event.status)) {
        return res.status(404).json({ message: 'Event is not available for booking.' });
      }
      return res.status(409).json({ message: 'The selected ticket type is sold out.' });
    }

    if (reservedEvent.ticketTiers.length && !ticketTierId) {
      await Event.updateOne({ _id: reservedEvent._id }, { $inc: { availableTickets: 1 } });
      reservedEvent = null;
      return res.status(400).json({ message: 'Select a ticket tier to continue.' });
    }

    const tier = ticketTierId ? reservedEvent.ticketTiers.id(ticketTierId) : null;
    if ((tier?.price ?? reservedEvent.price) > 0) {
      const rollback = { $inc: { availableTickets: 1 } };
      const rollbackQuery = { _id: reservedEvent._id };
      if (ticketTierId) {
        rollback.$inc['ticketTiers.$.availableTickets'] = 1;
        rollbackQuery['ticketTiers._id'] = ticketTierId;
      }
      await Event.updateOne(rollbackQuery, rollback);
      reservedEvent = null;
      return res.status(402).json({ message: 'Payment is required for this ticket. Submit a payment slip first.' });
    }

    const ticketCode = randomUUID();
    const qrCodeImage = await QRCode.toDataURL(ticketCode);
    const ticket = await Ticket.create({
      userId,
      eventId,
      ticketCode,
      ticketTierId: tier?._id,
      ticketTierName: tier?.name,
      price: tier?.price ?? reservedEvent.price,
      qrCode: qrCodeImage
    });

    await Notification.createForUsers([userId], {
      eventId,
      type: 'booking',
      message: `Your ticket for ${reservedEvent.title} is ready.`
    });

    res.status(201).json({ message: 'Ticket booked successfully', ticket });
  } catch (error) {
    if (reservedEvent) {
      const rollback = { $inc: { availableTickets: 1 } };
      const rollbackQuery = { _id: reservedEvent._id };
      if (selectedTierId) {
        rollback.$inc['ticketTiers.$.availableTickets'] = 1;
        rollbackQuery['ticketTiers._id'] = selectedTierId;
      }
      await Event.updateOne(rollbackQuery, rollback).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).populate('eventId');
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { bookTicket, getUserTickets };
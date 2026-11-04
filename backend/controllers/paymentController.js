const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const Notification = require('../models/Notification');

const uploadPaymentSlip = async (req, res) => {
  try {
    const { eventId, ticketTierId } = req.body;
    const amount = Number(req.body.amount);
    const userId = req.user.id;
    const slipPath = req.file ? req.file.path : '';

    if (!eventId || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Select a paid event and provide a valid amount.' });
    }
    if (!slipPath) return res.status(400).json({ message: 'Payment slip image is required' });

    const event = await Event.findById(eventId);
    if (!event || ['Draft', 'Cancelled'].includes(event.status)) {
      return res.status(404).json({ message: 'Event is not available for payment.' });
    }

    const tier = ticketTierId ? event.ticketTiers.id(ticketTierId) : null;
    if (ticketTierId && !tier) return res.status(400).json({ message: 'Ticket tier does not belong to this event.' });
    const expectedAmount = tier?.price ?? event.price;
    if (!expectedAmount || expectedAmount <= 0) {
      return res.status(400).json({ message: 'This event is free. Book your ticket from the event page.' });
    }
    if (amount !== expectedAmount) return res.status(400).json({ message: `Amount must match the ticket price of LKR ${expectedAmount}.` });
    if (event.availableTickets < 1 || (tier && tier.availableTickets < 1)) {
      return res.status(409).json({ message: 'This ticket type is sold out.' });
    }

    const payment = await Payment.create({
      userId,
      eventId,
      ticketTierId: tier?._id,
      amount,
      paymentSlip: slipPath
    });

    res.status(201).json({ message: 'Payment slip uploaded successfully and is awaiting approval', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'Pending' })
      .populate('userId', 'name email')
      .populate('eventId', 'title date venue')
      .sort({ createdAt: 1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error loading pending payments', error: error.message });
  }
};

const reviewPayment = async (req, res) => {
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject.' });
  }

  const session = await Payment.startSession();
  let response;
  let approvedNotification;
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ _id: req.params.id, status: 'Pending' }).session(session);
      if (!payment) {
        const error = new Error('Pending payment not found. It may already have been reviewed.');
        error.status = 404;
        throw error;
      }

      if (action === 'reject') {
        payment.status = 'Rejected';
        await payment.save({ session });
        response = { message: 'Payment rejected.', payment };
        return;
      }

      const inventoryQuery = {
        _id: payment.eventId,
        status: { $nin: ['Draft', 'Cancelled'] },
        availableTickets: { $gt: 0 }
      };
      const inventoryUpdate = { $inc: { availableTickets: -1 } };
      if (payment.ticketTierId) {
        inventoryQuery.ticketTiers = {
          $elemMatch: { _id: payment.ticketTierId, availableTickets: { $gt: 0 } }
        };
        inventoryUpdate.$inc['ticketTiers.$.availableTickets'] = -1;
      }

      const event = await Event.findOneAndUpdate(inventoryQuery, inventoryUpdate, { new: true, session });
      if (!event) {
        const error = new Error('Ticket inventory is no longer available. Reject this payment and refund it manually.');
        error.status = 409;
        throw error;
      }

      const tier = payment.ticketTierId ? event.ticketTiers.id(payment.ticketTierId) : null;
      const ticketCode = randomUUID();
      const ticket = new Ticket({
        userId: payment.userId,
        eventId: event._id,
        ticketCode,
        ticketTierId: tier?._id,
        ticketTierName: tier?.name,
        price: payment.amount,
        qrCode: await QRCode.toDataURL(ticketCode)
      });
      await ticket.save({ session });

      payment.status = 'Approved';
      payment.ticketId = ticket._id;
      await payment.save({ session });
      approvedNotification = {
        userId: payment.userId,
        eventId: event._id,
        message: `Your payment for ${event.title} was approved. Your ticket is ready.`
      };
      response = { message: 'Payment approved and ticket issued.', payment, ticket };
    });

    if (approvedNotification) {
      await Notification.createForUsers([approvedNotification.userId], {
        eventId: approvedNotification.eventId,
        type: 'payment-approved',
        message: approvedNotification.message
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Could not review payment.' });
  } finally {
    await session.endSession();
  }
};

module.exports = { uploadPaymentSlip, getPendingPayments, reviewPayment };
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketTierId: { type: mongoose.Schema.Types.ObjectId },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  amount: { type: Number, required: true },
  paymentSlip: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
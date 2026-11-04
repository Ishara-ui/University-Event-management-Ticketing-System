const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketCode: { type: String, required: true, unique: true, default: randomUUID },
  ticketTierId: { type: mongoose.Schema.Types.ObjectId },
  ticketTierName: { type: String },
  price: { type: Number, min: 0, default: 0 },
  qrCode: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Checked-In', 'Cancelled'], default: 'Active' },
  checkedInAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
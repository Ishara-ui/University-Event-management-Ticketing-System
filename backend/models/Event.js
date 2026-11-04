const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  availableTickets: { type: Number, required: true, min: 0 }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  seedKey: { type: String, unique: true, sparse: true, select: false },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Academic', 'Tech', 'Technology', 'Cultural', 'Sports', 'Workshop', 'Workshops']
  },
  date: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  banner: { type: String },
  price: { type: Number, min: 0, default: 0 },
  ticketLimit: { type: Number, required: true },
  availableTickets: { type: Number, required: true },
  ticketTiers: { type: [ticketTierSchema], default: [] },
  status: { type: String, enum: ['Draft', 'Published', 'Cancelled'], default: 'Published' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
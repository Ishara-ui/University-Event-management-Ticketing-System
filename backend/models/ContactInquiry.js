const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: {
    type: String,
    required: true,
    enum: ['Ticket & QR Code Issue', 'Event Registration Question', 'Organizer Account Request', 'Technical Bug Report']
  },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
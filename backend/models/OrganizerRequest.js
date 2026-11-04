const mongoose = require('mongoose');

const organizerRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedRole: { type: String, enum: ['Event Organizer', 'Faculty Lead'], required: true },
  faculty: { type: String, required: true, trim: true, maxlength: 120 },
  justification: { type: String, required: true, trim: true, minlength: 20, maxlength: 3000 },
  status: { type: String, enum: ['Pending', 'In Review', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

organizerRequestSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('OrganizerRequest', organizerRequestSchema);
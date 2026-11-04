const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  type: { type: String, enum: ['booking', 'event-updated', 'event-cancelled', 'payment-approved'], required: true },
  message: { type: String, required: true, trim: true },
  readAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.statics.createForUsers = async function (userIds, notification) {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))];
  if (!uniqueIds.length) return;

  try {
    await this.insertMany(uniqueIds.map((userId) => ({ ...notification, userId })));
  } catch (error) {
    console.error('Could not create notifications:', error.message);
  }
};

module.exports = mongoose.model('Notification', notificationSchema);
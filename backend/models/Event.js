JavaScript
const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
 Ɵtle: { type: String, required: true },
 descripƟon: { type: String, required: true },
 category: { type: String, required: true },
 date: { type: Date, required: true },
 venue: { type: String, required: true },
 banner: { type: String },
 ƟcketLimit: { type: Number, required: true },
 availableTickets: { type: Number, required: true },
 createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { Ɵmestamps: true });
module.exports = mongoose.model('Event', eventSchema); 
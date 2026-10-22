JavaScript 
const mongoose = require('mongoose'); 
const cketSchema = new mongoose.Schema({ 
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, 
qrCode: { type: String, required: true }, 
status: { type: String, enum: ['Ac ve', 'Checked-In', 'Cancelled'], default: 'Ac ve' } 
}, { mestamps: true }); 
module.exports = mongoose.model('Ticket', cketSchema);
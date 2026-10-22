JavaScript 
const mongoose = require('mongoose'); 
const paymentSchema = new mongoose.Schema({ 
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, 
amount: { type: Number, required: true }, 
paymentSlip: { type: String, required: true }, 
status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' } 
}, { mestamps: true }); 
 
module.exports = mongoose.model('Payment', paymentSchema);
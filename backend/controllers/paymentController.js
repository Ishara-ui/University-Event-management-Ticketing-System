JavaScript 
const Payment = require('../models/Payment'); 
 
exports.uploadPaymentSlip = async (req, res) => { 
  try { 
    const { eventId, amount } = req.body; 
    const userId = req.user.id; 
    const slipPath = req.file ? req.file.path : ''; 
 
    if (!slipPath) { 
      return res.status(400).json({ message: 'Payment slip image is required' }); 
    } 
 
    const payment = await Payment.create({ 
      userId, 
      eventId, 
      amount, 
      paymentSlip: slipPath 
    }); 
 
    res.status(201).json({ message: 'Payment slip uploaded successfully, awai ng approval', payment 
}); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
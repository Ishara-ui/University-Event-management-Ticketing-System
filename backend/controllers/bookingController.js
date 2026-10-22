JavaScript 
const Ticket = require('../models/Ticket'); 
const Event = require('../models/Event'); 
const QRCode = require('qrcode'); 
 
exports.bookTicket = async (req, res) => { 
  try { 
    const { eventId } = req.body; 
    const userId = req.user ? req.user.id : req.body.userId; 
 
    const event = await Event.findById(eventId); 
    if (!event || event.availableTickets <= 0) { 
      return res.status(400).json({ message: 'Tickets sold out or event not found' }); 
    } 
 
    const qrData = JSON.stringify({ userId, eventId, mestamp: Date.now() }); 
    const qrCodeImage = await QRCode.toDataURL(qrData); 
 
    const cket = await Ticket.create({ 
      userId, 
      eventId, 
      qrCode: qrCodeImage 
    }); 
 
    event.availableTickets -= 1; 
    await event.save(); 
 
    res.status(201).json({ message: 'Ticket booked successfully', cket }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}; 
 
exports.getUserTickets = async (req, res) => { 
  try { 
    const userId = req.user.id; 
    const ckets = await Ticket.find({ userId }).populate('eventId'); 
    res.status(200).json( ckets); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
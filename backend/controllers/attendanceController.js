JavaScript 
const Ticket = require('../models/Ticket'); 
 
exports.scanQRCode = async (req, res) => { 
  try { 
    const { cketId } = req.body; 
    const cket = await Ticket.findById( cketId).populate('userId eventId'); 
 
    if (! cket) { 
      return res.status(404).json({ message: 'Invalid Ticket or Ticket not found' }); 
    } 
 
    if ( cket.status === 'Checked-In') { 
      return res.status(400).json({ message: 'Ticket already used! A endance already marked.' }); 
    } 
 
    cket.status = 'Checked-In'; 
    await cket.save(); 
 
    res.status(200).json({  
      message: 'A endance Marked Successfully!',  
      cket  
    }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}; 
 
exports.getEventAttendance = async (req, res) => {
     try { 
    const { eventId } = req.params; 
    const checkedInTickets = await Ticket.find({ eventId, status: 'Checked-In' }).populate('userId', 
'name email faculty'); 
     
    res.status(200).json({ 
      totalCheckedIn: checkedInTickets.length, 
      attendees: checkedInTickets 
    }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
JavaScript 
import React from 'react'; 
import axios from 'axios'; 
 
const BookTicket = ({ eventId, onBooked }) => { 
  const handleBooking = async () => { 
    try { 
      const token = localStorage.getItem('token'); 
      const res = await axios.post( 
        'h p://localhost:5000/api/bookings', 
        { eventId }, 
        { headers: { Authoriza on: `Bearer ${token}` } } 
      ); 
      alert('Ticket booked successfully!'); 
      if (onBooked) onBooked(res.data. cket); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Booking failed'); 
    } 
  }; 
 
  return ( 
    <bu on  
      onClick={handleBooking} 
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"> 
      Book Ticket Now 
    </bu on> 
  ); 
}; 
export default BookTicket; 

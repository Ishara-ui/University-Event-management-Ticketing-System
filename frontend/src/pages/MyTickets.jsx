JavaScript 
import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
 
const MyTickets = () => { 
  const [ ckets, setTickets] = useState([]); 
 
  useEffect(() => { 
    const fetchTickets = async () => { 
      try { 
        const token = localStorage.getItem('token'); 
        const res = await axios.get('h p://localhost:5000/api/bookings/my-ckets', { 
          headers: { Authoriza on: `Bearer ${token}` } 
        }); 
        setTickets(res.data); 
      } catch (err) { 
        console.error(err); 
      } 
    }; 
    fetchTickets(); 
  }, []); 
 
  return ( 
    <div className="max-w-4xl mx-auto p-6"> 
      <h2 className="text-2xl font-bold mb-6 text-blue-600">My Booked Tickets</h2> 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
        { ckets.map(( cket) => ( 
          <div key={ cket._id} className="bg-white p-4 rounded-lg shadow border flex flex-col items
center"> 
            <h3 className="text-xl font-bold mb-2">{ cket.eventId?. tle}</h3> 
            <p className="text-gray-500 text-sm mb-4">Status: <span className="text-green-600 font
semibold">{ cket.status}</span></p> 
            <img src={ cket.qrCode} alt="Ticket QR Code" className="w-40 h-40 border p-2" /> 
          </div> 
        ))} 
      </div> 
    </div> 
  ); 
}; 
 
export default MyTickets;
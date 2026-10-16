JavaScript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react{
import axios from 'axios';
const EventDetails = () => {
 const { id } = useParams();
 const [event, setEvent] = useState(null);
 useEffect(() => {
 axios.get(`hƩp://localhost:5000/api/events/${id}`)
 .then((res) => setEvent(res.data))
 .catch((err) => console.error(err));
 }, [id]);
 if (!event) return <div className="text-center mt-10">Loading...</div>;
 return (
 <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
 <h1 className="text-3xl font-bold mb-4">{event.Ɵtle}</h1>
 <p className="text-gray-500 mb-2">Category: {event.category} | Venue: {event.venue}</p>
 <p className="text-gray-500 mb-4">Date: {new Date(event.date).toLocaleString()}</p>
 <p className="text-lg mb-6">{event.descripƟon}</p>
 <p className="font-semibold text-green-600">Available Tickets: {event.availableTickets} /
{event.ƟcketLimit}</p>
 </div>
 );
};
export default EventDetails; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import PaymentUpload from './pages/PaymentUpload';
import ManageEvents from './pages/ManageEvents';
import AttendanceList from './pages/AtendanceList';
import QRScanner from './pages/QRScanner';
import PaymentManager from './pages/PaymentManager';
import Contact from './pages/Contact';
import OrganizerRequest from './pages/OrganizerRequest';
import OrganizerRequestManager from './pages/OrganizerRequestManager';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/organizer-request" element={<OrganizerRequest />} />
          <Route path="/admin/organizer-requests" element={<OrganizerRequestManager />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/payments" element={<PaymentUpload />} />
          <Route path="/payments/review" element={<PaymentManager />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/attendance/scanner" element={<QRScanner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
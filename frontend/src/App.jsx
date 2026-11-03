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

function App() {
  return (
    <Router>
      <div className="app-container">
        

        <Routes>
         
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />

          
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
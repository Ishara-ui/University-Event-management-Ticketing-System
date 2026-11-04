import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['Club Admin', 'Super Admin'].includes(user.role);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshops',
    date: '',
    venue: ''
  });
  const [ticketTiers, setTicketTiers] = useState([{ name: 'General Admission', price: '', capacity: '' }]);
  const [status, setStatus] = useState('Published');
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBanner(e.target.files[0]);
  };

  const updateTier = (index, field, value) => {
    setTicketTiers((current) => current.map((tier, tierIndex) => (
      tierIndex === index ? { ...tier, [field]: value } : tier
    )));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('ticketTiers', JSON.stringify(ticketTiers));
    data.append('status', status);
    if (banner) data.append('banner', banner);

    try {
      await axios.post('http://localhost:5000/api/events', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/events');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not create the event. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !canManage) {
    return (
      <div className="container">
        <section className="event-empty panel create-access-panel">
          <h2>{token ? 'Organizer access required' : 'Sign in to continue'}</h2>
          <p>{token
            ? `Your account is currently ${user.role || 'Student'}. Club Admins and Super Admins can publish events. Request organizer access from the university team.`
            : 'Sign in with a Club Admin or Super Admin account to publish campus events.'}</p>
          <div className="create-access-actions">
            {token ? (
              <Link to="/contact?subject=Organizer%20Account%20Request" className="btn primary-btn">Request organizer access</Link>
            ) : (
              <Link to="/login" className="btn primary-btn">Sign in</Link>
            )}
            <Link to="/events" className="btn muted-btn">Browse events</Link>
            {token && <Link to="/my-tickets" className="btn muted-btn">My tickets</Link>}
            {token && <Link to="/payments" className="btn muted-btn">Payments</Link>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card form-card">
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" name="title" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" onChange={handleChange}>
              <option value="Academic">Academic</option>
              <option value="Tech">Tech</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshops">Workshops</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="datetime-local" name="date" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Venue</label>
            <input type="text" name="venue" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ticket Limit</label>
            {ticketTiers.reduce((sum, tier) => sum + Number(tier.capacity || 0), 0)} tickets across all tiers
          </div>
          <fieldset className="tier-editor">
            <legend>Ticket tiers</legend>
            {ticketTiers.map((tier, index) => (
              <div className="ticket-tier-row" key={`tier-${index}`}>
                <label>
                  Tier name
                  <input value={tier.name} onChange={(e) => updateTier(index, 'name', e.target.value)} required />
                </label>
                <label>
                  Price (LKR)
                  <input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} required />
                </label>
                <label>
                  Capacity
                  <input type="number" min="1" step="1" value={tier.capacity} onChange={(e) => updateTier(index, 'capacity', e.target.value)} required />
                </label>
                {ticketTiers.length > 1 && (
                  <button type="button" className="btn muted-btn" onClick={() => setTicketTiers((current) => current.filter((_, tierIndex) => tierIndex !== index))}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn muted-btn" onClick={() => setTicketTiers((current) => [...current, { name: '', price: '', capacity: '' }])}>
              Add ticket tier
            </button>
          </fieldset>
          <div className="form-group">
            <label>Publication status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Published">Publish now</option>
              <option value="Draft">Save as draft</option>
            </select>
          </div>
          <div className="form-group">
            <label>Banner</label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
          </div>
          <button type="submit" className="btn primary-btn" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
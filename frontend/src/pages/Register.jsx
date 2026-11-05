import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    faculty: '',
    studentId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      await axios.post(`${API_URL}/auth/register`, formData);
      
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} />
            <small>Password must be at least 8 characters.</small>
          </div>
          <div className="form-group">
            <label>Faculty</label>
            <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Faculty of Technology" />
          </div>
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} autoComplete="off" />
          </div>
          <button type="submit" className="btn secondary-btn" style={{ width: '100%' }}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
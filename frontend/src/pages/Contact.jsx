import React, { useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const inquiryOptions = ['Ticket & QR Code Issue', 'Event Registration Question', 'Organizer Account Request', 'Technical Bug Report'];
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    subject: inquiryOptions.includes(searchParams.get('subject')) ? searchParams.get('subject') : 'Ticket & QR Code Issue',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSubmitted(false);
    setReference('');
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSubmitted(false);

    try {
      const response = await axios.post('http://localhost:5000/api/contact', form, { timeout: 10000 });
      setReference(response.data.reference || '');
      setSubmitted(true);
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not submit your inquiry. Please try again or email support@unieventx.edu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container contact-page">
      <header className="contact-heading">
        <span className="eyebrow">South Eastern University</span>
        <h1>How can we help?</h1>
        <p>Reach out about event inquiries, ticketing support, registration, or technical issues.</p>
      </header>

      <div className="contact-layout">
        <aside className="contact-information" aria-label="University contact information">
          <div className="contact-information-heading">
            <span className="eyebrow">Contact information</span>
            <h2>Get in touch</h2>
          </div>

          <section className="contact-detail">
            <span className="contact-detail-label">Department</span>
            <strong>Department of Information &amp; Communication Technology</strong>
            <span>Faculty of Technology, SEUSL</span>
          </section>

          <section className="contact-detail">
            <span className="contact-detail-label">Email</span>
            <a href="mailto:support@unieventx.edu">support@unieventx.edu</a>
            <a href="mailto:info@seusl.ac.lk">info@seusl.ac.lk</a>
          </section>

          <section className="contact-detail">
            <span className="contact-detail-label">Administration</span>
            <a href="tel:+94672255062">+94 67 2255062 / 5063 / 5064</a>
            <span>General university contact line</span>
          </section>

          <section className="contact-detail">
            <span className="contact-detail-label">Office location</span>
            <strong>Faculty of Technology / ICT Centre</strong>
            <span>University Park, Oluvil 32360, Sri Lanka</span>
            <a href="https://maps.google.com/?q=South+Eastern+University+of+Sri+Lanka+Oluvil" target="_blank" rel="noreferrer">Open map <span aria-hidden="true">↗</span></a>
          </section>

          <section className="contact-hours">
            <span className="contact-detail-label">Suggested support hours</span>
            <strong>Monday–Friday · 8:30 AM–4:15 PM</strong>
            <span> Sri Lanka time; excluding university holidays. Confirm department hours with the university.</span>
          </section>

          <a className="contact-official-link" href="https://www.seu.ac.lk/contactus.php" target="_blank" rel="noreferrer">Official university contact page <span aria-hidden="true">↗</span></a>
        </aside>

        <section className="contact-form-panel">
          <div className="contact-form-heading">
            <span className="eyebrow">Send an inquiry</span>
            <h2>Tell us what you need</h2>
            <p>Send your inquiry to the university event support team.</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <div className="contact-form-row">
              <label>Student Name<input name="name" value={form.name} onChange={updateForm} autoComplete="name" required /></label>
              <label>Email<input name="email" type="email" value={form.email} onChange={updateForm} autoComplete="email" required /></label>
            </div>
            <label>Inquiry subject
              <select name="subject" value={form.subject} onChange={updateForm}>
                {inquiryOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Message<textarea name="message" value={form.message} onChange={updateForm} rows="7" minLength="10" placeholder="Describe your question or issue..." required /></label>
            <div className="contact-form-submit">
              <button type="submit" className="btn primary-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit inquiry'}</button>
              {submitted && (
                <span className="contact-submit-note" role="status">
                  Inquiry submitted{reference ? ` · Reference ${reference}` : ''}. For direct follow-up, email <a href="mailto:support@unieventx.edu">support@unieventx.edu</a>.
                </span>
              )}
            </div>
          </form>
        </section>
      </div>

      <div className="contact-back-link"><Link to="/events">Browse campus events</Link></div>
    </main>
  );
};

export default Contact;
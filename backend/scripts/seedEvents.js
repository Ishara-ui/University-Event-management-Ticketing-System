require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Event = require('../models/Event');

const futureDate = (days, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const sampleEvents = [
  {
    seedKey: 'demo-academic-forum',
    title: '[DEMO] Academic Research Forum',
    category: 'Academic',
    date: futureDate(10, 9),
    venue: 'Main Auditorium',
    description: 'A sample academic forum for student research presentations and faculty discussion.',
    price: 0,
    ticketLimit: 120,
    availableTickets: 120,
    ticketTiers: [{ name: 'Student Admission', price: 0, capacity: 120, availableTickets: 120 }]
  },
  {
    seedKey: 'demo-technology-expo',
    title: '[DEMO] Campus Technology Expo',
    category: 'Tech',
    date: futureDate(16, 10),
    venue: 'Faculty of Technology',
    description: 'A sample showcase of student projects, software, robotics, and emerging technology.',
    price: 0,
    ticketLimit: 100,
    availableTickets: 100,
    ticketTiers: [{ name: 'General Admission', price: 0, capacity: 100, availableTickets: 100 }]
  },
  {
    seedKey: 'demo-cultural-showcase',
    title: '[DEMO] Culture and Arts Showcase',
    category: 'Cultural',
    date: futureDate(23, 17),
    venue: 'Open Air Theatre',
    description: 'A sample evening celebrating music, dance, and creative work from across campus.',
    price: 500,
    ticketLimit: 250,
    availableTickets: 250,
    ticketTiers: [{ name: 'General Admission', price: 500, capacity: 250, availableTickets: 250 }]
  },
  {
    seedKey: 'demo-interfaculty-sports',
    title: '[DEMO] Interfaculty Sports Day',
    category: 'Sports',
    date: futureDate(30, 8),
    venue: 'University Sports Grounds',
    description: 'A sample day of interfaculty competitions, team events, and campus activities.',
    price: 0,
    ticketLimit: 500,
    availableTickets: 500,
    ticketTiers: [{ name: 'Spectator Admission', price: 0, capacity: 500, availableTickets: 500 }]
  },
  {
    seedKey: 'demo-research-workshop',
    title: '[DEMO] Student Research Skills Workshop',
    category: 'Workshops',
    date: futureDate(37, 13),
    venue: 'ICT Centre Seminar Room',
    description: 'A sample practical workshop covering research planning, presentations, and academic writing.',
    price: 250,
    ticketLimit: 40,
    availableTickets: 40,
    ticketTiers: [{ name: 'Workshop Seat', price: 250, capacity: 40, availableTickets: 40 }]
  },
  {
    seedKey: 'demo-seusl-research-conference',
    title: '[DEMO] SEUSL Undergraduate Research Conference',
    category: 'Academic',
    date: futureDate(44, 9),
    venue: 'Main Auditorium',
    description: 'A sample conference for undergraduate research talks, poster sessions, and faculty-led discussions.',
    price: 0,
    ticketLimit: 180,
    availableTickets: 180,
    ticketTiers: [{ name: 'Student Delegate', price: 0, capacity: 180, availableTickets: 180 }]
  },
  {
    seedKey: 'demo-ict-innovation-conference',
    title: '[DEMO] ICT Innovation and Technology Conference',
    category: 'Tech',
    date: futureDate(58, 9),
    venue: 'Faculty of Technology Conference Hall',
    description: 'A sample technology conference featuring student projects, research presentations, and industry talks.',
    price: 750,
    ticketLimit: 140,
    availableTickets: 140,
    ticketTiers: [{ name: 'Conference Delegate', price: 750, capacity: 140, availableTickets: 140 }]
  },
  {
    seedKey: 'demo-cultural-night',
    title: '[DEMO] University Cultural Night 2026',
    category: 'Cultural',
    date: futureDate(65, 18),
    venue: 'Open Air Theatre',
    description: 'A sample grand cultural evening with traditional dance, music performances, and drama from student societies.',
    price: 1000,
    ticketLimit: 300,
    availableTickets: 300,
    ticketTiers: [
      { name: 'Regular Seating', price: 1000, capacity: 220, availableTickets: 220 },
      { name: 'VIP Seating', price: 2500, capacity: 80, availableTickets: 80 }
    ]
  },
  {
    seedKey: 'demo-career-fair',
    title: '[DEMO] SEUSL Career Fair and Industry Day',
    category: 'Academic',
    date: futureDate(72, 9),
    venue: 'University Gymnasium Complex',
    description: 'A sample career fair connecting final-year students with industry partners, CV clinics, and on-the-spot interviews.',
    price: 0,
    ticketLimit: 400,
    availableTickets: 400,
    ticketTiers: [{ name: 'Student Entry', price: 0, capacity: 400, availableTickets: 400 }]
  }
];

const seed = async () => {
  await connectDB();

  try {
    
    const results = await Promise.all(sampleEvents.map(async (event) => {
      const existing = await Event.findOne({ seedKey: event.seedKey });
      if (existing) {
       
        existing.ticketTiers = existing.ticketTiers.map((current, index) => ({
          name: current.name,
          price: current.price,
          capacity: current.capacity,
          availableTickets: current.availableTickets
        }));
        existing.date = event.date;
        await existing.save();
        return null;
      }
      const { date, ...rest } = event;
      const created = await Event.create({ ...rest, date });
      return created;
    }));
    const inserted = results.filter(Boolean).length;
    console.log(`Seed complete: ${inserted} new demo events added; ${results.length - inserted} existing demo events refreshed (dates reset, tier IDs ensured).`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch(async (error) => {
  console.error('Event seeding failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, faculty, studentId } = req.body;

    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Student',
      faculty,
      studentId
    });

    res.status(201).json({
      message: 'User registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        studentId: user.studentId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ message: 'Login is not configured. Set JWT_SECRET in backend/.env and restart the backend.' });
    }

    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    const databaseUnavailable = /mongo|mongoose|topology|server selection|ssl|tls/i.test(`${error.name} ${error.message}`);
    res.status(databaseUnavailable ? 503 : 500).json({
      message: databaseUnavailable
        ? 'Login service cannot reach MongoDB. Check the Atlas cluster, network access allowlist, and MONGO_URI.'
        : 'Unable to log in right now. Please try again.'
    });
  }
};

module.exports = { register, login, registerUser: register, loginUser: login };
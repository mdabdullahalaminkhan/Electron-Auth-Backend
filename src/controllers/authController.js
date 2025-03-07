const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { fullName, email, password } = req.body;
    
    // Validate input
    if (!fullName || !email || !password) {
      console.log('Missing fields:', { 
        fullName: !!fullName, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        message: 'All fields are required',
        details: {
          fullName: !fullName ? 'Full name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create user
    const user = new User({ fullName, email, password });
    await user.save();
    
    console.log('User registered successfully:', { email, fullName });
    return res.status(201).json({ 
      message: 'Registration successful',
      userId: user._id 
    });

  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email is already registered',
        error: 'duplicate_email'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({ 
      message: 'Server error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
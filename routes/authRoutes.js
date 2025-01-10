const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// GET: Signup form
router.get('/signup', (req, res) => {
  res.render('signup', { message: req.flash('error') }); // Render signup form
});

// POST: Signup user
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = new User({ name, email });
    await User.register(newUser, password); // Register user with hashed password
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error registering user.');
    res.redirect('/signup');
  }
});

// GET: Login form
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') }); // Render login form
});

// POST: Login user
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/', // Redirect after successful login
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    // This function will run after successful login if authentication is successful
    req.flash('success', `Welcome to the Expense Tracker, ${req.user.name}!`); // Welcome message
    res.redirect('/'); // You can redirect to the homepage or dashboard
  }
);

// GET: Dashboard (protected route)
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You need to log in first!');
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user }); // Render dashboard for authenticated users
});

// GET: Logout user
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Error logging out.');
      return res.redirect('/dashboard');
    }
    req.flash('success', 'Logged out successfully!');
    res.redirect('/login');
  });
});

module.exports = router;

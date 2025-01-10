const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Import LocalStrategy
const User = require('./models/user'); // Import User model
const authRoutes = require('./routes/authRoutes');
const flash = require('connect-flash');
const expenseRoutes = require('./routes/expenseRoutes');
const MongoStore = require('connect-mongo');

// Load environment variables
require('dotenv').config();

// App Initialization
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

// Use `mongoUrl` for session store
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // MongoDB connection URI
      crypto: {
        secret: process.env.SECRET, // Encryption key for session data
      },
      touchAfter: 24 * 3600, // Update session only once in 24 hours
    }),
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Secure the cookie
    },
  })
);

// Flash messages setup
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, // Tell Passport to use "email" instead of "username"
    User.authenticate()
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set flash messages and current user
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

// Use Routes
app.use('/', expenseRoutes);
app.use('/', authRoutes);

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

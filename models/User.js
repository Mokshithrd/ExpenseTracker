const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Passport-local-mongoose will add a username and password field and handle hashing
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model('User', userSchema);
module.exports = User;

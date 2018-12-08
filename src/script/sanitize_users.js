const mongoose = require('mongoose');
const random_name = require('node-random-name');
require('./../db');

// MongoDB Objects
const User = mongoose.model('User');
const CheckIn = mongoose.model('CheckIn');
const Place = mongoose.model('Place');
const Tip = mongoose.model('Tip');
const Rating = mongoose.model('Rating');

function create_user() {
  const name = random_name({
    first: true
  });
  const user = new User({
    name: name,
    email: name + "@gmail.com",
    password: "BadIdea"+name
  });
  user.save(function (err) {
    if (err) throw err;
    console.log("Created User: " + name);
  });
}

module.exports = function (number_users) {
  for (let i = 0; i < number_users; i++) {
    create_user();
  }
}

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
  return new Promise(function (resolve, reject) {
    const name = random_name({
      first: true
    });
    const user = new User({
      name: name,
      email: name + "@gmail.com",
      password: "BadIdea" + name
    });
    user.save(function (err) {
      if (err) reject(err);
      console.log("Created User: " + name);
      resolve();
    });
  });
}

module.exports = function (number_users, cb) {
  function wrapped_callback(errors) {
    if (!errors) {
      return cb();
    }
    return cb(errors.find(error => error !== undefined));
  }
  let promises = [];
  for (let i = 0; i < number_users; i++) {
    promises.push(create_user());
  }
  Promise.all(promises).then(wrapped_callback, wrapped_callback);
}

const mongoose = require('mongoose');
require('../db');

// MongoDB Objects
const User = mongoose.model('User');
const CheckIn = mongoose.model('CheckIn');
const Place = mongoose.model('Place');
const Tip = mongoose.model('Tip');
const Rating = mongoose.model('Rating');

const tips = ["This place is sick", "Much greatness", "If you turn on the light, it beomces brighter"];

function create_checkin(user, place){
  const rating = new Rating({
    like: Math.floor(Math.random()* 3 -1),
    rater: user
  });
  rating.save(function (rating_err){
    if(rating_err) throw err;
    const tip = new Tip({
      comment: tips[Math.floor(Math.random()*tips.length)],
      tipper: user
    });
    tip.save(function (tip_err){
      if(tip_err) throw err;
      const checkin = new CheckIn({
        spot: place,
        time: new Date(Date.now()),
        tip: tip,
        rating: rating
      });
      checkin.save(function (err){
        if (err) throw err;
        place.ratings.push(rating);
        place.tips.push(tip);
        place.check_ins.push(checkin);
        place.save(function (err){
          if (err) throw err;
          console.log("Saved checkin for ", user.name, " at ", place.name);
        });
      });
    });
  });
}

function add_checkin_to_user() {
  User.findOne({}, (err, user, count) => {
    if (err) throw err;
    Place.findOne({}, (err, place, count) => {
      if (err) throw err;
      create_checkin(user, place);
    });
  });
}

module.exports = function (number_users) {
  add_checkin_to_user();
}

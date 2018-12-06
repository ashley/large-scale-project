const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('./db');
const app = express();

// MongoDB Objects
const User = mongoose.model('User');
const CheckIn = mongoose.model('CheckIn');
const Place = mongoose.model('Place');
const Tip = mongoose.model('Tip');
const Rating = mongoose.model('Rating');

const googleMapsClient = require('@google/maps').createClient({
  key: '63c9bedefbc4066a842716ce75bd31c6a082dc4c'
});

// Front-End Wiring
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Routing
app.get('/', (req, res) => {
  // load spots
  // Add them to an array
  res.render('index', {user: {name: 'ashley'}, spots: [{name: 'a'}, {name: 'b'}]});
});

app.get('/check-in', (req, res) => {

  res.render('checkin');
});

app.post('/check-in', (req, res) => {
  Place.find().or([{ name: place_name, address: place_address}])
    .then(place => {
      const spot = new Spot({
        spot: req.body.place,
        time: req.body.time,
        tip: req.body.tip || "",
        rating: req.body.rating || ""
      })
      place.save(function(err){
        if(err) throw err;
          res.redirect('/');
      });
    })
    .catch(err => {
      throw err;
    });
});

app.listen(3000, function () {
  console.log("Running server on localhost:3000");
});

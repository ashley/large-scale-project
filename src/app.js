const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const UserFactory = require('./script/sanitize_users.js');
const PlaceFactory = require('./script/sanitize_places.js');
const CheckInFactory = require('./script/sanitize_check_ins.js');
const app = express();

// MongoDB Objects
const User = mongoose.model('User')
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
app.use(bodyParser.urlencoded({ extended: false }));


// Routing
app.get('/', (req, res) => {
  res.send("Yeet");
});

app.get('/check-in', (req, res) => {
  // load spots
  Place.find({}, (err, places, count) => {
    if(places){
      res.render('checkin',  {spots: places});
    }
    if(err){
      throw err; //for now
    }
  })
});

app.post('/check-in', (req, res) => {
  let time = new Date();
  //res.redirect('/');
  Place.findOne({place_id: req.body.placeGoogleId})
    .then(place => {
      // Check is the place exist
      if (place) {
        // const checkin = new CheckIn({
        //   spot: place,
        //   time: time,
        //   tip: req.body.tip || "",
        //   rating: req.body.rating || ""
        // })
        const checkin = new CheckIn({
          spot: null,
          time: null,
          tip: req.body.tip || null,
          rating: req.body.rating || null
        })
        console.log(place);
        place.check_ins.push(checkin);
        place.save(function(err){
          if(err) throw err;
            checkin.save(function(err){
              if(err) throw err;
              res.redirect('/');
            })
        });
      }
      else{
        // Place is not found
        const place = new Place({
          name: req.body.placeName,
          address: req.body.placeAddress,
          place_id: req.body.placeGoogleId,
          lat: req.body.placeLat,
          lng: req.body.placeLong,
          wifi: req.body.wifi,
          bathroom: req.body.bathroom,
          quiet: req.body.quiet,
          ratings: [],
          tips: [],
          check_ins: []
        });
        place.save(function(err){
          if(err) throw err;
          const checkin = new CheckIn({
            spot: null,
            time: null,
            tip: null,
            rating: null
          })
          place.check_in.push(checkin);
          checkin.save(function(err){
            if(err) throw err;
              res.redirect('/');
          });
        });
      }
    })
    .catch(err => {
      throw err;
    });
});

app.listen(3000, function () {
  console.log("Running server on localhost:3000");
  UserFactory(2);
  PlaceFactory();
  CheckInFactory();
});

const express = require('express');
const mongoose = require('mongoose');
const nconf = require('nconf');
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
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());


// Routing
app.get('/', (req, res) => {
  // Landing page - just directs to map instead
  res.redirect('/check-in');
});

app.get('/button', (req, res) => {
  // 1. Uses mongo's $near query to find places in db
  Place.find({
    geo: {
      $near: {
        $maxDistance: 2000, // in meters
        $geometry: {
          type: "Point",
          coordinates: [req.query.lng, req.query.lat]
        }
      }
    }
  }).find((error, results) => {
    if (error) console.log(error);
    // 2. Sorts query into data for front-end
    const new_data = {
      spots: results,
      setLat: req.query.lat,
      setLong: req.query.lng
    };
    // 3. Gets passed to the front-end
    res.json(new_data);
  });
})

app.get('/check-in', (req, res) => {
  Place.find({}, (err, places, count) => {
    if (places) {
      res.render('checkin', {
        spots: places,
        setLat: false,
        setLong: false
      });
    }
    if (err) {
      throw err; //for now
    }
  })
});

app.post('/check-in', (req, res) => {
  let time = new Date();
  let placeKind = req.body.placeKind;
  let wifiVal;
  let bathroomVal;
  let quietVal;
  if (placeKind === 'wifi') {
    wifiVal = true;
  }
  if (placeKind === 'quiet') {
    quietVal = true;
  }
  if (placeKind === 'bathroom') {
    bathroomVal = true
  }
  let user;
  User.findOne({}, (err, userFound, count) => {
    if (err) throw err;
    if (userFound) {
      user = userFound;
    }
  });
  // Writes checkin data into existing place
  // Nested callbacks because of mongo reference usage
  Place.findOne({
    place_id: req.body.placeGoogleId
  }, (err, place, count) => {
    if (err) throw err;
    if (place) {
      const rating = new Rating({
        like: parseInt(req.body.rating),
        rater: user
      });
      rating.save(function (rating_err) {
        if (rating_err) throw err;
        const tip = new Tip({
          comment: req.body.tip,
          tipper: user
        });
        tip.save(function (tip_err) {
          if (tip_err) throw err;
          const checkin = new CheckIn({
            spot: place,
            time: new Date(Date.now()),
            tip: tip,
            rating: rating
          });
          checkin.save(function (err) {
            if (err) throw err;
            //only write to database if true to override possible false value
            if (wifiVal) {
              place.wifi = true;
            }
            if (quietVal) {
              place.quiet = true;
            }
            if (bathroomVal) {
              place.bathroom = true;
            }

            let numb_rating = place.tips.length + 1;
            let new_avg = place.agg_rating * ((numb_rating) - 1) / numb_rating + parseFloat(req.body.rating) / numb_rating;
            place.agg_rating = new_avg;
            place.ratings.push(rating);
            place.tips.push(tip);
            place.check_ins.push(checkin);
            place.save(function (err) {
              if (err) throw err;
              res.redirect('/check-in');
            });
          });
        });
      });
    } else {
      const new_place = new Place({
        name: req.body.placeName,
        address: req.body.placeAddress,
        place_id: req.body.placeGoogleId,
        lat: req.body.placeLat,
        lng: req.body.placeLong,
        geo: {
          type: "Point",
          coordinates: [Number(req.body.placeLong), Number(req.body.placeLat)]
        },
        wifi: req.body.wifi ? true : false,
        bathroom: req.body.bathroom ? true : false,
        quiet: req.body.quiet ? true : false,
        ratings: [],
        tips: [],
        check_ins: []
      });
      new_place.save(function (err) {
        if (err) throw err;
      });
      const rating = new Rating({
        like: parseInt(req.body.rating),
        rater: user
      });
      rating.save(function (rating_err) {
        if (rating_err) throw err;
        const tip = new Tip({
          comment: req.body.tip,
          tipper: user
        });
        tip.save(function (tip_err) {
          if (tip_err) throw err;
          const checkin = new CheckIn({
            spot: new_place,
            time: new Date(Date.now()),
            tip: tip,
            rating: rating
          });
          checkin.save(function (err) {
            if (err) throw err;
            new_place.agg_rating = parseInt(req.body.rating);
            new_place.ratings.push(rating);
            new_place.tips.push(tip);
            new_place.check_ins.push(checkin);
            new_place.save(function (err) {
              if (err) throw err;
              res.redirect('/check-in');
            });
          });
        });
      });
    }
  });
});

nconf.argv().env().file('keys.json');

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

let mlabURI = `mongodb://${user}:${pass}@${host}.mlab.com:${port}`;
const devURI = `mongodb://localhost:27017/large-scale-project`

if (nconf.get('mongoDatabase')) {
  mlabURI = `${mlabURI}/${nconf.get('mongoDatabase')}`;
}

// To continue working locally - 
// replace mlabURI in mongoose.connect() with devURI, already initalized above
console.log(mlabURI)
mongoose.connect(devURI, {
  useNewUrlParser: true
}, function (err, db) {
  console.log('Connected to MongoDB');
  const collection_names = Object.keys(db.collections);
  app.listen(8080, function () {
    console.log("Running server on localhost:8080");
  });
});

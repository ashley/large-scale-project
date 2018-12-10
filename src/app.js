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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Routing
app.get('/', (req, res) => {
  res.send("Yeet");
});

app.get('/button', (req, res) => {
  console.log(req.query);
  Place.find({
    geo: {
     $near: {
      $maxDistance: 2000,
      $geometry: {
       type: "Point",
       coordinates: [req.query.lng, req.query.lat]
      }
     }
    }
   }).find((error, results) => {
    if (error) console.log(error);
    console.log(results);
    res.render('checkin', {spots: results});
   });
})
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
  let wifiVal;
  let bathroomVal;
  let quietVal;
  if (req.body.wifi) {
    wifiVal = true;
  }
  if (req.body.quiet) {
    quietVal = true;
  }
  if (req.body.bathroom) {
    bathroomVal = true
  }
  let user;
  User.findOne({}, (err, userFound, count) => {
    if (err) throw err;
    if (userFound) {
      user=userFound;
    }
  });
  Place.findOne({place_id: req.body.placeGoogleId}, (err, place, count) => {
    if (err) throw err;
    if (place) {
      const rating = new Rating({
        like: parseInt(req.body.rating),
        rater: user
      });
      rating.save(function (rating_err){
        if(rating_err) throw err;
        const tip = new Tip({
          comment: req.body.tip,
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
            place.ratings.push(rating);
            place.tips.push(tip);
            place.check_ins.push(checkin);
            place.save(function (err){
              if (err) throw err;
              console.log("Saved checkin at already created:", req.body.placeName);
            });
          });
        });
      });
    } else { //place did not exist, create new place
      const new_place = new Place({
        name: req.body.placeName,
        address: req.body.placeAddress,
        place_id: req.body.placeGoogleId,
        lat: req.body.placeLat,
        lng: req.body.placeLong,
        wifi: req.body.wifi ? true : false,
        bathroom: req.body.bathroom ? true : false,
        quiet: req.body.quiet ? true : false,
        ratings: [],
        tips: [],
        check_ins: []
      });
      new_place.save(function (err) {
        if (err) throw err;
        console.log("Created New Place: " + req.body.placeName);
      });
      const rating = new Rating({
        like: parseInt(req.body.rating),
        rater: user
      });
      rating.save(function (rating_err){
        if(rating_err) throw err;
        const tip = new Tip({
          comment: req.body.tip,
          tipper: user
        });
        tip.save(function (tip_err){
          if(tip_err) throw err;
          const checkin = new CheckIn({
            spot: new_place,
            time: new Date(Date.now()),
            tip: tip,
            rating: rating
          });
          checkin.save(function (err){
            if (err) throw err;
            new_place.ratings.push(rating);
            new_place.tips.push(tip);
            new_place.check_ins.push(checkin);
            new_place.save(function (err){
              if (err) throw err;
              console.log("Saved checkin at newly created:", req.body.placeName);
            });
          });
        });
      });
    }
  });
  // Place.findOne({place_id: req.body.placeGoogleId})
  //   .then(place => {
  //     // Check is the place exist
  //     if (place) {
  //       // const checkin = new CheckIn({
  //       //   spot: place,
  //       //   time: time,
  //       //   tip: req.body.tip || "",
  //       //   rating: req.body.rating || ""
  //       // })
  //       const checkin = new CheckIn({
  //         spot: null,
  //         time: null,
  //         tip: req.body.tip || null,
  //         rating: req.body.rating || null
  //       })
  //       console.log(place);
  //       place.check_ins.push(checkin);
  //       place.save(function(err){
  //         if(err) throw err;
  //           checkin.save(function(err){
  //             if(err) throw err;
  //             res.redirect('/');
  //           })
  //       });
  //     }
  //     else{
  //       // Place is not found
  //       const place = new Place({
  //         name: req.body.placeName,
  //         address: req.body.placeAddress,
  //         place_id: req.body.placeGoogleId,
  //         lat: req.body.placeLat,
  //         lng: req.body.placeLong,
  //         wifi: req.body.wifi,
  //         bathroom: req.body.bathroom,
  //         quiet: req.body.quiet,
  //         ratings: [],
  //         agg_rating: 0,
  //         tips: [],
  //         check_ins: []
  //       });
  //       place.save(function(err){
  //         if(err) throw err;
  //         const checkin = new CheckIn({
  //           spot: null,
  //           time: null,
  //           tip: null,
  //           rating: null
  //         })
  //         place.check_in.push(checkin);
  //         checkin.save(function(err){
  //           if(err) throw err;
  //             res.redirect('/');
  //         });
  //       });
  //     }
  //   })
  //   .catch(err => {
  //     throw err;
  //   });
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

/*
Yo00oo to continue working locally - 

replace mlabURI in mongoose.connect() with devURI, already initalized above
*/

console.log(mlabURI)
mongoose.connect(mlabURI, {useNewUrlParser: true} , function (err, db) {
  console.log('Connected to MongoDB');
  const collection_names = Object.keys(db.collections);
  app.listen(8080, function () {
    console.log("Running server on localhost:8080");
    UserFactory(2, function (err) {
      if (err) throw err;
      console.log("Done with user");
      PlaceFactory(function(err) {
        if (err) throw err;
        CheckInFactory();
      });
    });
  });
});

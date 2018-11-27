const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('./db');
const app = express();
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
  res.render('index');
});

app.listen(3000, function () {
  console.log("Running server on localhost:3000");
});

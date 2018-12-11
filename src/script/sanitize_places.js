const mongoose = require('mongoose');
require('../db');

// MongoDB Objects
const Place = mongoose.model('Place');

const places = {
  stern: {
    name: "Stern School of GOATs",
    address: "44 West 4th Street, New York, NY 10012, USA",
    place_id: "Eis0NCBXZXN0IDR0aCBTdHJlZXQsIE5ldyBZb3JrLCBOWSAxMDAxMiwgVVNBIhoSGAoUChIJHTZlZ5BZwokRGhwC1VhJe68QLA",
    lat: 40.72896069999999,
    lng: -73.9963497,
    geo: {
      type: "Point",
      coordinates: [-73.9963497, 40.72896069999999]
    },
    wifi: true,
    bathroom: true,
    quiet: false
  },
  parsons: {
    name: "Parsons School of Design",
    address: "66 5th Ave, New York, NY 10011, USA",
    place_id: "ChIJF743J5hZwokRx9ri0YoZZX0",
    lat: 40.7352741,
    lng: -73.99455269999999,
    geo: {
      type: "Point",
      coordinates: [-73.99455269999999, 40.7352741]
    },
    wifi: true,
    bathroom: false,
    quiet: true
  },
  pizza: {
    name: "Pizza Mercato",
    address: "11 Waverly Pl, New York, NY 10003, USA",
    place_id: "ChIJKdZtcJpZwokRl55o6EeuFo0",
    lat: 40.7301485,
    lng: -73.99407710000003,
    geo: {
      type: "Point",
      coordinates: [-73.99407710000003, 40.7301485]
    },
    wifi: false,
    bathroom: true,
    quiet: false
  },
  bagel: {
    name: "Murray's Bagels",
    address: "500 6th Ave, New York, NY 10011, USA",
    place_id: "ChIJ-aUnyZdZwokROurMS3QFqhI",
    lat: 40.7363143,
    lng: -73.99712069999998,
    geo: {
      type: "Point",
      coordinates: [-73.99712069999998, 40.7363143]
    },
    wifi: true,
    bathroom: false,
    quiet: false
  }
}

function create_place(place) {
  return new Promise( function(resolve, reject){
    const new_place = new Place({
      name: place.name,
      address: place.address,
      place_id: place.place_id,
      lat: place.lat,
      lng: place.lng,
      geo: {
        type: "Point",
        coordinates: [place.lng, place.lat]
      },
      wifi: place.wifi,
      bathroom: place.bathroom,
      quiet: place.quiet
    });
    new_place.save(function (err) {
      if (err) reject(err);
      console.log("Created Place: " + place.name);
      resolve();
    });
  });
}

module.exports = function (cb) {
  function wrapped_callback(errors) {
    if (!errors) { return cb(); }
    return cb(errors.find(error => error !== undefined));
  }
  let promises = [];
  for(let i in places){
    promises.push(create_place(places[i]));
  }
  Promise.all(promises).then(wrapped_callback, wrapped_callback);
}

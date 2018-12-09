const mongoose = require('mongoose');
require('../db');

// MongoDB Objects
const Place = mongoose.model('Place');

const places = {
  stern: {
    name: "Stern School of Snekes",
    address: "44 West 4th Street, New York, NY 10012, USA",
    place_id: "Eis0NCBXZXN0IDR0aCBTdHJlZXQsIE5ldyBZb3JrLCBOWSAxMDAxMiwgVVNBIhoSGAoUChIJHTZlZ5BZwokRGhwC1VhJe68QLA",
    lat: 40.72896069999999,
    lng: -73.9963497,
    category: "Bathroom",
  },
  parsons: {
    name: "Parsons School of Design",
    address: "66 5th Ave, New York, NY 10011, USA",
    place_id: "ChIJF743J5hZwokRx9ri0YoZZX0",
    lat: 40.7352741,
    lng: -73.99455269999999,
    category: "Quiet Place"
  },
  pizza: {
    name: "Pizza Mercato",
    address: "11 Waverly Pl, New York, NY 10003, USA",
    place_id: "ChIJKdZtcJpZwokRl55o6EeuFo0",
    lat: 40.7301485,
    lng: -73.99407710000003,
    category: "Bathroom",
  },
  bagel: {
    name: "Murray's Bagels",
    address: "500 6th Ave, New York, NY 10011, USA",
    place_id: "ChIJ-aUnyZdZwokROurMS3QFqhI",
    lat: 40.7363143,
    lng: -73.99712069999998,
    category: "WiFi"
  }
}

function create_place(place) {
  const new_place = new Place({
    name: place.name,
    address: place.address,
    place_id: place.place_id,
    lat: place.lat,
    lng: place.lng,
    category: place.category,
  });
  new_place.save(function (err) {
    if (err) throw err;
    console.log("Created Place: " + place.name);
  });
}

module.exports = function () {
  for(let i in places){
    create_place(places[i]);
  }
}

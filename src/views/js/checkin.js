let firstPlace;
let map;
let dbMarkers = [];
let markers = [];

function hideDBMarkers() {
  dbMarkers.forEach(function (marker) {
    marker.setMap(null);
  });
}

function showDBMarkers() {
  let wifiOnly = document.getElementsByName("wifiFilter")[0].checked;
  let bathroomOnly = document.getElementsByName("bathroomFilter")[0].checked;
  let quietOnly = document.getElementsByName("quietFilter")[0].checked;

  dbMarkers.forEach(function (marker) {
    if (!((wifiOnly && !marker.wifi) || (bathroomOnly && !marker.bathroom) ||
        (quietOnly && !marker.quiet))) {
      marker.setMap(map);
    }
  });
}

function reloadDBMarkers() {
  hideDBMarkers();
  showDBMarkers();
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (loc) {
      fetch('/button?lat=' + loc.coords.latitude + '&lng=' + loc.coords.longitude).then(function (response) {
        response.json().then(data => {
          map.setCenter({
            lat: parseFloat(data.setLat),
            lng: parseFloat(data.setLong)
          });
        });
      });
    });
  } else {
  }
}

function updatePlace(place, click) {
  firstPlace = place;
  document.getElementById("placeNameInput").setAttribute('value', firstPlace.name);
  if (click) {
    document.getElementById("placeAddressInput").setAttribute('value', firstPlace.address);
  } else {
    document.getElementById("placeAddressInput").setAttribute('value', firstPlace.formatted_address);
  }
  let tipContent = "";
}

function geocodeAddress(geocoder, resultsMap) {
  let address = firstPlace.formatted_address;
  geocoder.geocode({
    'address': address
  }, function (results, status) {
    if (status === 'OK') {
      let position = results[0].geometry.location;
      resultsMap.setCenter(position);
      let string = JSON.stringify(position)
      let obj = JSON.parse(string)

      document.getElementById("placeGoogleId").setAttribute('value', firstPlace.place_id);
      document.getElementById("placeLat").setAttribute('value', obj.lat);
      document.getElementById("placeLong").setAttribute('value', obj.lng);
    } else {
      alert('Geocode was not successful for the following reason: ' + JSON.stringify(status));
    }
  });
}

function initAutocomplete(curLat = undefined, curLong = undefined) {
  let docLat = document.getElementById("innerLat") ? document.getElementById("innerLat").innerHTML : false;
  if (curLat != undefined) docLat = curLat;
  let docLong = document.getElementById("innerLat") ? document.getElementById("innerLat").innerHTML : false;
  if (curLong != undefined) docLong = curLong;
  let setLat = docLat ? docLat : 40.7308;
  let setLong = docLong ? docLong : -73.9973;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: setLat,
      lng: setLong
    },
    zoom: 15,
    mapTypeId: 'roadmap'
  });

  let spots = JSON.parse(document.getElementById("spotList").innerHTML);

  spots.forEach(function (place) {
    let position = {
      lat: place.lat,
      lng: place.lng
    };
    let marker = new google.maps.Marker({
      map: map,
      title: place.name,
      position: position,
      place_id: place.place_id,
      wifi: place.wifi,
      bathroom: place.bathroom,
      quiet: place.quiet
    });

    let content = place.name + "<br>" + place.address + "<br>" +
      "Rating: " + place.agg_rating.toFixed(2) + ", after " + place.ratings.length +
      " reviews.";
    let infowindow = new google.maps.InfoWindow({
      content: content
    });

    marker.addListener('click', function () {
      updatePlace(place, true);
      markers.forEach(marker => marker.setMap(null));
    });

    marker.addListener('mouseover', function () {
      infowindow.open(map, marker);
    });

    marker.addListener('mouseout', function () {
      infowindow.close();
    })

    dbMarkers.push(marker);
  });

  reloadDBMarkers();

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  console.log(input);
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });

  markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();
    console.log("places: ", places)

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];
    updatePlace(places[0]);
    let geocoder = new google.maps.Geocoder();
    geocodeAddress(geocoder, map);

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      if (!place.geometry) {
        return;
      }

      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      let marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });

      let infowindow = new google.maps.InfoWindow({
        content: place.name + "<br>" + place.formatted_address
      });

      marker.addListener('click', function () {
        updatePlace(place);
      });

      marker.addListener('mouseover', function () {
        infowindow.open(map, marker);
      });

      marker.addListener('mouseout', function () {
        infowindow.close();
      })

      // Create a marker for each place.
      markers.push(marker);

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

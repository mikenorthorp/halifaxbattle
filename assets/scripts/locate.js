// Global variables
var geoLocationIsEnabled = true;
var map;
var initialLocation = new google.maps.LatLng(45.432096, 28.061957);
var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);

// Variables for long and latitude
var longCord = 0;
var latCord = 0;
var latLngCord = null;

// Page setup
var setUp = false;

//Set initial soldier count
var soldierCount = 1000;

// Set up map marker image of soldier
var mapMarker =
  new google.maps.MarkerImage('/assets/images/army.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(12, 62));

// Set current marker to null
var currentMarker = null;

//For debugging
var update_count = 0;
var watchId;

// Create an object containing LatLng
var safeZones = {};
safeZones['Resupply Zone'] = {
  center: new google.maps.LatLng(44.640030, -63.694286),
}
var safeZoneCircle;

var battleZones = {};
battleZones['Battle Zone'] = {
  center: new google.maps.LatLng(44.637405, -63.590846),
}
var battleZoneCircle;

// Set up minimap to start tracking location

function setUpMap() {
  // Page set up
  setUp = true;
  // Set options for google map
  var myOptions = {
    zoom: 18,
    disableDefaultUI: true,
    center: initialLocation,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: false,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);


  for (var zone in safeZones) {
    var zoneOptions = {
      strokeColor: '#008000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#008000',
      fillOpacity: 0.35,
      map: map,
      center: safeZones[zone].center,
      radius: 100
    };
    safeZoneCircle = new google.maps.Circle(zoneOptions);
  }

  for (var zone in battleZones) {
    var zoneOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: battleZones[zone].center,
      radius: 100
    };
    battleZoneCircle = new google.maps.Circle(zoneOptions);
  }


  // Get the users current position
  getCurrentPosition();

}

function getCurrentPosition() {
  if (navigator.geolocation) {
    geoLocationIsEnabled = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      $('#coordinates').html("Position: " + position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6));
      initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      moveMarker(initialLocation);
      //Set long and lat to variable
      longCord = position.coords.longitude.toFixed(6);
      latCord = position.coords.latitude.toFixed(6);
      latLngCord = initialLocation;
    }, function() {
      geolocationNotEnabled(geoLocationIsEnabled);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000
    });
  } else {
    geoLocationIsEnabled = false;
    geolocationNotEnabled(geoLocationIsEnabled);
  }

  if (geoLocationIsEnabled) {
    watchId = navigator.geolocation.watchPosition(function(position) {
      $('#coordinates').html("Position: " + position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6));
      //Set long and lat to variable
      longCord = position.coords.longitude.toFixed(6);
      latCord = position.coords.latitude.toFixed(6);
      latLngCord = initialLocation;

      if (position.coords.accuracy <= 50) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        moveMarker(initialLocation);
      }
    }, function() {
      geolocationNotEnabled(geoLocationIsEnabled);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000
    });
  }
}

function geolocationNotEnabled(errorFlag) {
  if (errorFlag == true) {
    $('#errorMessage').html("Geolocation service failed.");
    initialLocation = newyork;
  } else {
    $('#errorMessage').html("Your browser doesn't support geolocation. We've placed you in New York.");
    initialLocation = newyork;
  }
  map.setCenter(initialLocation);
}

// This function moves the marker whenever the user is moving

function moveMarker(location) {
  if (currentMarker == null) {
    currentMarker = new google.maps.Marker({
      position: location,
      draggable: false,
      map: map,
      icon: mapMarker
    });
    //Center the user on their current location
    map.setCenter(location);
  } else {
    currentMarker.setPosition(location);
    map.setCenter(location);
  }

  // Increase update count for testing purposes
  update_count++;

  // Update other info everytime the marker is moved
  $('#updateCount').html("Update Count: " + update_count);
  $('#soldierCount').html("Soldier Count " + soldierCount);
  $('#errorMessage').html("");
}

// Runs every 3 seconds to update soldier count if loaded and update count based on area
window.setInterval(function() {
  if (setUp) {
    var bounds;

    // Get bounds
    var bounds = safeZoneCircle.getBounds();
    //Check if in safe zone, increase soldier count to max of 1500
    if (bounds.contains(latLngCord)) {
      //alert("in safezone");
      if (soldierCount < 1500) {
        soldierCount += 100;
        // Show user info about current location
        $('#infoBox').html("You are currently in a safe zone and gaining soldiers");
      } else {
        // Show user info about current location
        $('#infoBox').html("You are currently in a safe zone and have gained the maximum amount of soldiers");
      }
    }

    // Get bounds
    bounds = battleZoneCircle.getBounds();
    //Check if in battle zone, decrease soldier count to a minimum of 0
    if (bounds.contains(latLngCord)) {
      //alert("in battlezone");
      if (soldierCount > 0)
        soldierCount -= 100;
      // Show user info about current location
      $('#infoBox').html("You are currently in a battle and losing soldiers");
    }
    // Keep soldier count up to date
    $('#soldierCount').html("Soldier Count " + soldierCount);
  }
}, 3000);
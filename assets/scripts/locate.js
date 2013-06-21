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

// Set up zone arrays for safe and battles
var safeZones = {};
var safeZoneCircle;

var battleZones = {};
var battleZoneCircle;

// This function creates a new battle or safe zone at the cooridnates passed in
function createZone(nameP, colorP, typeP, lat, lng, radiusP) {
  var newZone = {
    name: nameP,
    color: colorP,
    center: new google.maps.LatLng(lat, lng),
    radius: radiusP
  }

  if(typeP == "battle"){
    battleZones[newZone.name] = newZone;
  } else {
    safeZones[newZone.name] = newZone;
  }
}

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
    draggable: true,
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  // Create all of the zones
  createZone("French Safe Zone", "#008000", "safe", 44.64838, -63.58339, 100);
  createZone("English Safe Zone", "#008000", "safe", 44.64566, -63.57875, 100);
  createZone("Battle Zone 1", "#FF0000", "battle", 44.64638, -63.58151, 100);
  createZone("Battle Zone 2", "#FF0000", "battle", 44.64849, -63.57905, 100);

  // Add safe zones into google maps
  for (var zone in safeZones) {
    var zoneOptions = {
      strokeColor: safeZones[zone].color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: safeZones[zone].color,
      fillOpacity: 0.35,
      map: map,
      center: safeZones[zone].center,
      radius: safeZones[zone].radius
    };
    safeZoneCircle = new google.maps.Circle(zoneOptions);
  }

  // Add battle zones into google maps
  for (var zone in battleZones) {
    var zoneOptions = {
      strokeColor: battleZones[zone].color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: battleZones[zone].color,
      fillOpacity: 0.35,
      map: map,
      center: battleZones[zone].center,
      radius: battleZones[zone].radius
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
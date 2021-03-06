// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  // Call map code
  Template.submit.rendered = function() {

    var factions_list = '';

    /* This function submits username and player team */
    $(document).ready(function() {
      $("#factionSubmit").click(function() {
        $('#float').show();
        var name = document.getElementById('name').value;

        if (name == '') {
          name = "Player";
        }

        var factions = document.getElementById('profile').elements['faction'];

        for (i = 0; i < factions.length; i++) {
          if (factions[i].checked) {
            factions_list += factions[i].value;
          }
        }

        document.getElementById('factionName').innerHTML = "Faction: " + factions_list;
        console.log(factions_list);
        $('#infoHeader').html("Battle Information");
        $('#playerName').html("Name: " + name);

        $("#profile").remove();
        $("#instructions").remove();
        $('#title').remove();

        // Call google map setup
        setUpMap();
      });
    });

    // Global variables
    var geoLocationIsEnabled = true;
    var map;
    var initialLocation = new google.maps.LatLng(45.432096, 28.061957);
    var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);

    // Variables for long and latitude
    var longCord = 0;
    var latCord = 0;
    var latLngCord = null;


    // Start soldier count
    var englishSoldiers = 6000;
    var frenchSoldiers = 6000;

    // Page setup
    var setUp = false;
    var inBattleZone = false;
    var inSafeZone = false;

    //Set initial soldier count

    var soldierCount = 1000;
    var inBattle = 0;

    // Set up map marker image of soldier
    var mapMarker =
      new google.maps.MarkerImage('assets/images/army.png',
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
        radius: radiusP,
        circle: null
      }

      if (typeP == "battle") {
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
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true
      };
      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

      // Create all of the zones
      createZone("French Safe Zone", "#008000", "safe", 44.64838, -63.58339, 100);
      createZone("English Safe Zone", "#008000", "safe", 44.64566, -63.57875, 100);
      createZone("Battle Zone 1", "#FF0000", "battle", 44.64638, -63.58151, 100);
      createZone("Battle Zone 2", "#FF0000", "battle", 44.64849, -63.57905, 100);

      // Test zone for battle
      createZone("Battle Zone test", "#FF0000", "battle", 44.637581, -63.587166, 100);
      createZone("Safe Zone Test", "#008000", "safe", 44.648901,-63.575335, 100);

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
        safeZones[zone].circle = safeZoneCircle;
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
        battleZones[zone].circle = battleZoneCircle;
      }


      // Get the users current position
      getCurrentPosition();

    }

    function getCurrentPosition() {
      if (navigator.geolocation) {
        geoLocationIsEnabled = true;
        navigator.geolocation.getCurrentPosition(function(position) {
          console.log("Position: " + position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6));
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
          console.log("Position: " + position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6));
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
      // Log updates to console
      console.log("Update Count: " + update_count);

      $('#soldierCount').html("Personal Soldier Count " + soldierCount);
      $('#errorMessage').html("");
    }

    // Rally your troops, add and attack the enemy
    $("#rallyTroops").click(function() {
      var player = Players.findOne();
      // Update the zone count on entry depending on side
      if (factions_list == "English Player") {
        console.log("Rallied english side");
        Players.update(player._id, {
          $inc: {
            english: 200
          }
        });
      }

      // French side
      if (factions_list == "French Player") {
        console.log("Rallied french side");
        Players.update(player._id, {
          $inc: {
            french: 200
          }
        });
      }

      // Hide button for 10 seconds
      $('#rallyTroops').hide();
      setTimeout(
        function() {
          $('#rallyTroops').show();
        }, 10000);

    });

    // Runs every 3 seconds to update soldier count if loaded and update count based on area
    window.setInterval(function() {
      if (setUp) {
        // Get bounds
        var bounds;

        /* Safe Zone Logic */

        // Check if player is in a safe zone
        for (var zone in safeZones) {
          // Get bounds
          bounds = safeZones[zone].circle.getBounds();
          //Check if in safe zone, increase soldier count to max of 1500
          if (bounds.contains(latLngCord)) {
            inSafeZone = true;
            break;
          }
        }

        if (inSafeZone) {
          if (soldierCount < 1500) {
            soldierCount += 50;
            // Show user info about current location
            $('#infoBox').html("You are currently in a safe zone and gaining soldiers");
          } else {
            // Show user info about current location
            $('#infoBox').html("You are currently in a safe zone and have gained the maximum amount of soldiers");
          }
        } else {
          inSafeZone = false;
        }


        // Get database zone and soldier count for each side
        var player = Players.findOne();
        frenchSoldiers = player.french;
        englishSoldiers = player.english;

        if (frenchSoldiers == null) {
          frenchSoldiers = 0;
          return 0;
        }

        if (englishSoldiers == null) {
          englishSoldiers = 0;
          return 0;
        }


        // Check if player is in a battle zone
        for (var zone in battleZones) {
          // Get bounds
          bounds = battleZones[zone].circle.getBounds();
          //Check if in battle zone
          if (bounds.contains(latLngCord)) {
            inBattleZone = true;
            break;
          }
        }

        // If they are in a battle zone
        if (inBattleZone) {
          // Add soldiers to pool if entering zone only once
          // English side
          if (inBattle == 0) {
            $('#rallyTroops').show();
            // Update the zone count on entry depending on side
            if (factions_list == "English Player") {
              console.log("Added to english side");
              Players.update(player._id, {
                $inc: {
                  english: soldierCount
                }
              });
            }

            // French side
            if (factions_list == "French Player") {
              console.log("Added to french side");
              Players.update(player._id, {
                $inc: {
                  french: soldierCount
                }
              });
            }

            // Set in battle to true
            inBattle = 1;
          }

          // Update and display soldier count
          player = Players.findOne();
          $('#englishSide').html("French Side: " + player.french);
          $('#frenchSide').html("English Side : " + player.english);

          if (soldierCount >= 10) {
            soldierCount -= 10;
            // Show user info about current location
            $('#infoBox').html("You are currently in a battle and losing soldiers");
          } else {
            // User has lost all of his soldiers in the current battle
            soldierCount = 0;
            $('#infoBox').html("You have lost all of your soldiers, please go to your safe zone to gain more");
          }

        } else {
          console.log("Not in zone but wasn't leaving battle");
          inBattleZone = false;

          // Set battle zone fields to not show again when not in zone
          // Show user info about current location
          $('#englishSide').html("");
          $('#frenchSide').html("");

          // Set in battle to false when they leave
          if (inBattle == 1) {
            console.log("Leaving battle zone");
            $('#rallyTroops').hide();
            // Remove their current soldier count from battle if possible.
            // Update the zone count on entry depending on side
            if (factions_list == "English Player") {
              console.log("Removed from english side");
              Players.update(player._id, {
                $set: {
                  english: -soldierCount
                }
              });
            }

            // French side
            if (factions_list == "French Player") {
              console.log("Removed from french side");
              Players.update(player._id, {
                $set: {
                  french: -soldierCount
                }
              });
            }

            // Set in battle to false
            inBattle = 0;
          }
        }

        // Check if they are not in any zone and clear zone alert fields
        if (!inBattleZone && !inSafeZone) {
          $('#zoneAlert').html("You are not in a battle! Head to a green or red zone to get more soldiers or battle!");
          $('#infoBox').html("");
        }


        // Keep soldier count up to date
        $('#soldierCount').html("Personal Soldier Count " + soldierCount);

        // Simulate battle numbers in background
        // Update french soldier count
        frenchSoldiers = player.french;
        frenchSoldiers = frenchSoldiers - (10 * Math.floor((Math.random() * 10) + 0));
        Players.update(player._id, {
          $set: {
            french: frenchSoldiers
          }
        });

        // Update english soldier count
        englishSoldiers = player.english;
        englishSoldiers = englishSoldiers - (10 * Math.floor((Math.random() * 10) + 0));
        Players.update(player._id, {
          $set: {
            english: englishSoldiers
          }
        });

        // If soldiers run out and no one is around add soldiers for regen
        if (englishSoldiers <= 0) {
          englishSoldiers = 5000;
          if (inBattleZone) {
            $('#zoneAlert').html("The French Have Won The Zone! Refinforcments called!");
          }
          Players.update(player._id, {
            $set: {
              english: englishSoldiers
            }
          });
        }

        if (frenchSoldiers <= 0) {
          frenchSoldiers = 5000;
          if (inBattleZone) {
            $('#zoneAlert').html("The English Have Won The Zone! Refinforcments called!");
          }
          Players.update(player._id, {
            $set: {
              french: frenchSoldiers
            }
          });
        }

      }
    }, 3000);
  }

  Template.test.players = function() {
    return Players.find({}, {
      sort: {
        zone: -1,
        english: 1,
        french: 1
      }
    });
  };

  Template.leaderboard.selected_name = function() {
    var player = Players.findOne();
    return player && player.zone && player.english && player.french;
  };

  Template.player.selected = function() {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function() {
      Players.update(Session.get("selected_player"), {
        $inc: {
          score: 5
        }
      });
    }
  });

  Template.player.events({
    'click': function() {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function() {
    if (Players.find().count() === 0) {
      Players.insert({
        zone: "BattleZone",
        english: 10000,
        french: 10000
      });
    }
  });
}
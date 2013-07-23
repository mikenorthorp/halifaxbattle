/* This function submits username and player team */
$(document).ready(function() {
  $("#factionSubmit").click(function() {
    $('#float').show();
    var name = document.getElementById('name').value;

    if (name != null) {
      var profile_name = name;
    }

    $('#playerName').html("Name: " + profile_name);

    var factions = document.getElementById('profile').elements['faction'];
    var factions_list = '';

    for (i = 0; i < factions.length; i++) {
      if (factions[i].checked) {
        factions_list += factions[i].value;
      }
    }

    document.getElementById('factionName').innerHTML = "Faction: " + factions_list;
    $("#profile").remove();
    console.log("Removed profile?");
    $('#title').remove();

    // Call google map setup
    setUpMap();
  });
});
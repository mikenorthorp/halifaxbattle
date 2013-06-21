/* This function submits username and player team */
$(document).ready(function() {
  $("#factionSubmit").click(function() {
    var name = document.getElementById('name').value;

    if (name != null) {
      var profile_name = name;
    }

    document.getElementById('NAME').innerHTML = "Name: " + profile_name;

    var factions = document.getElementById('profile').elements['faction'];
    var factions_list = '';

    for (i = 0; i < factions.length; i++) {
      if (factions[i].checked) {
        factions_list += factions[i].value;
      }
    }

    document.getElementById('FACTION').innerHTML = "Faction: " + factions_list;
    document.getElementById('profile').innerHTML = "";

    // Call google map setup
    setUpMap();
  });
});
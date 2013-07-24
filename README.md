README
======

This is the project repository for a project in Software Engineering at Dalhousie
University.

This application uses the Meteor with Node.js, MongoDB and HTML5.

It has Risk style gameplay and revolves around Cidital Hill in Halifax. Players join the game via a webpage and choose a side to fight
for around the Cidital. Players command an army and go to designated battle zones to
attack the other players. They contribute to the battle by going into different zones, which increases
the soldier attack multiplier for that zone. They can then temporarily take control of that zone and move
onto another zone.

Requirements
------------

- Meteor
- Node.js
- Mongodb
- HTML5 Capable Browser
- Own Server if Deploying Yourself (Recommend Nginx)
- Mobile Device with GPS enabled
- Must Play Outside


Installation and Deployment
---------------------------

### Easy Installation

1. First install meteor on your server in Terminal `curl https://install.meteor.com | sh`
2. Grab a copy of the source from SVN or Git
3. Go into the halifaxbattle directory `cd leaderboard`
4. Deploy it to a meteor server `meteor deploy insertNameHere.meteor.com`

### Alternative Installation

If you want to deploy on your own server it is a bit tricky, do steps 1 and 2 above then the following.

1. You must first install mongodb and node.js on your server
2. Then grab a copy of the source and use `meteor bundle output.tar.gz` to get a bundled app
3. Extract the bundle and then cd to bundle/server and run `npm uninstall fibers`
4. Run `npm install fibers`
6. Run `mongod` to start your mongodb server
7. `cd ../../` and run `PORT=8080 MONGO_URL=mongodb://localhost:27017/myapp node bundle/main.js`


Other Notes
-----------

If you want to reset your meteor database for the project run `meteor reset`

To run locally on port 3000 run `meteor` and go to `localhost:3000`


How To Play
-----------

Welcome to Citadel Hill Battle!

*NOTE: In order to play this game, your handheld device must have GPS enabeled and you must be outside*

### Getting Started

Begin by entering a name and choosing to play for either the French or English team by clicking the appropriate button.

After the player has entered a name and selected a team, the player may enter the game by clicking the 'Play!' button.

### Objective

The game takes place around the Halifax Citadel. Different areas around the Citadel are designated as zones. Zones are controlled by either the French or the English. The player takes the roll of either an English or French general, intent on defeating the opposing side. The objective of the game is for the generals to travel from zone to zone, lending their troops and experience in battle to help their team take control of the entire map.


### How To Play

Each player enters the game with 1000 soldiers at their disposal. The player must then move from zone to zone, using their soldiers to fight battles in each zone. When a player enters a zone, their soldiers are pooled with the other soldiers from their team in the zone, battling against the opposing teams soldiers in the zone. A zone is controlled by which ever team has more soldiers in it.

As the battle takes place, players who are in the battle zones will loose troops in the fighting, so be sure to keep an eye on your troop count. Remember that each player is also a general, and that their simple presence is a boost to their army. The more generals that are in a zone for a team, the bigger advantage that team has of taking the zone.

Both the French and English teams have safe zones. These are zones that are safe for whatever team controls the zone and cannot be captured by the opposing team. When a player enters their respective safe zone, they will start to regian troops until they once again reach 1000 soldiers.



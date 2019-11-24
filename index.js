var i = [];
var players = [];

var allowPlayerJoin = false;
var segments = 0; //0 means 1 action per round (or D&D type). > 0 = clock type
var currentRound = 0;
var currentSegment = 0;


function resetPlayers() {
	players = [];
}

function addPlayer(playerName, charName, ipAddress, color, isGameMaster) {
	var addPlayer = true;
	var player = {};
	for(p in players) {
		if(p.playerName == playerName) {
			addPlayer = false;
		}
	}
	if(addPlayer) {
		player = {"playerName": playerName, "charName": charName, "ipAddress": ipAddress, "color": color, "isGM": isGameMaster};
		players.push(player);
	}
	return player;
} 

function newInit(s) {
	segments = s;
	currentRound = 1;
        allowPlayerJoin = true;
		
}

console.log("init system");
newInit(0);

console.log("adding player nick");
var r = addPlayer("nick", "turzol", "1.2.3.4", "#ccffaa", false);

console.log(players);





var i = [];
/*
	[0] = [

		[0] = ]
			{charName, topic}
		]

	]

*/


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

function addInitItem(r, s, t) {
	if(i[r] == null) {
		i[r] = [];
	}

	if(i[r][s] == null) {
		i[r][s] = [];
	}

	console.log("pushing into i[" + r + "][" + s + "]");
	//console.log(t);
	i[r][s].push(t);
}

function setInit(charName,segment,roundEnter) {
	var setValid = true;
	for(r in i) {
		for(s in r) {
			for(t in s) {
				if(t.charName == charName) {
					setValid = false;	
				}
			}
		}
	}

	if(setValid) {
		console.log("Add Init Item: " + roundEnter + " : " + segment);
		addInitItem(roundEnter, segment, {"charName": charName, "topic": "First Action"});
	}
}

function newInit(s) {
	segments = s;
	currentRound = 0;
    allowPlayerJoin = true;
    i = [];
	
}

function printInit() {
	for(j = 0; j < i.length; j++) {
		console.log("Round " + j)
		if(i[j] != null) {
			for(k = 0; k < i[j].length; k++) {
				console.log("Segment " + k);
				//console.log(i[j][k]);
				if(i[j][k]) {
					for(l = 0;l<i[j][k].length;l++) {
						console.log(i[j][k][l]);
					}
				}
			}
		}
	}
}


console.log("init system");
newInit(0);

console.log("adding players");
var r = addPlayer("nick", "turzol", "1.2.3.4", "#ccffaa", false);
r = addPlayer("sue", "susan", "4.3.2.1", "#cfacfa", true);
r = addPlayer("ken", "rakion", "1.1.1.1", "#bbbbbb", true);

//console.log(players);

setInit("turzol", 0, currentRound);
setInit("rakion", 5, 3);


printInit();

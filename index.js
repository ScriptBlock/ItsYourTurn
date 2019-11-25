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
	for(const p of players) {
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

	//console.log("pushing into i[" + r + "][" + s + "]");
	//console.log(t);
	i[r][s].push(t);
}

function setInit(charName,segment,roundEnter) {
	var setValid = true;
	for(const r of i) {
		for(const s of r) {
			if(s != null) {
				for(const t of s) {
					if(t.charName == charName) {
						setValid = false;	
					}
				}
			}
		}
	}

	if(setValid) {
		//console.log("Add Init Item: " + roundEnter + " : " + segment);
		addInitItem(roundEnter, segment, {"charName": charName, "turn": 1, "taken":false});
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
						console.log(j + "|" + k + "|" + l + ": ");
						console.log(i[j][k][l]);
					}
				}
			}
		}
	}
}

function actionsRemaining(r,s) {
	var retVal = 0;
	for(const item of i[r][s]) {
		if(!item.taken) {
			retVal++;
		}
	}
	return retVal;
}

function findNextSegment(r,s) {
	if(i[r][s] != null && i[r][s].length > 0) {
		console.log("Round: " + r + " : Segment " + s + " is not null and has items in it");
		return {"r": r, "s": s};

	} else {
		if(i[r] == null) {
			console.log("Round " + r + " doesn't exist.  Returning null");
			return null;
		}
		if(s == 0) {
			console.log("Have reached segment zero.  Moving to next round");
			r++;
			s = 40;
		}
		return findNextSegment(r, s-1)
	}
}

function advanceSegment(r,s) {
	if(segments == 0) { //D&D mode
		if(s==0) {
			r++;
			s = 40;
		}
		console.log("finding next segment round: " + r + " : Segment " + (s-1));
		nextSegment = findNextSegment(r,s-1);
		console.log("advancing segment.  next segment is: " );
		console.log(nextSegment)


	}
}

function finishTurn(r,s,item,goAgain) {
	i[r][s][item].taken = true;
	if(goAgain) {
		addInitItem(r+1, s, {"charName": i[r][s][item].charName, "turn": i[r][s][item].turn+1, "taken":false});
	}

	if(actionsRemaining(r,s) == 0) {
		console.log("Turn finished and no actions remaining in this segment.  Advancing Segment");
		advanceSegment(r,s);
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
setInit("rakion", 5, currentRound);
setInit("susan", 5, currentRound);

printInit();
console.log("----------------------------");

finishTurn(0,5,0, true);
finishTurn(0,5,1, true);
finishTurn(0,0,0, true);
console.log("----------------------------");

printInit();
console.log("----------------------------");




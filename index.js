var i = [];
/*
	[0] = [

		[0] = ]
			{playerName,charName, turn, taken, note, createTime, turnTakenTime}
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

function addInitReminder(r,s, player, character, note) {
	addInitItem(r,s, {"playerName": player, "charName": character, "note": note, "taken": false});
}

function setInit(playerName, charName,segment,roundEnter) {
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
		addInitItem(roundEnter, segment, {"playerName": playerName, "charName": charName, "turn": 1, "taken":false, "note": "Entered Initiative"});
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
		if(segments == 0) {
			if(s == 0) {
				console.log("Have reached segment zero.  Moving to next round");
				r++;
				s = 40;
			}
			return findNextSegment(r, s-1)
		} else {
			if(s == segments) {
				console.log("Have reached max segments. Moving to next round");
				r++;
				s = -1;
			}
			return findNextSegment(r,s+1);
		}
	}
}

function advanceSegment(r,s) {
	if(segments == 0) { //D&D mode
		if(s==0) {
			r++;
			s = 40;
		}
		nextSegment = findNextSegment(r,s-1);
	} else {
		if(s+1 == segments) {
			r++;
			s = 0;
		}
		nextSegment = findNextSegment(r,s+1);
	}
	console.log("advancing segment.  next segment is: " );
	console.log(nextSegment);
	//currentRound = nextSegment.r;
	//currentSegment = nextSegment.s;

}

function setTurnTaken(r,s,item) {
	if(i[r][s][item] != null) {
		i[r][s][item].taken = true;
	}
}

function finishTurn(r,s,item,goAgain) {
	if(!i[r][s][item] != null && !i[r][s][item].taken) {
		i[r][s][item].taken = true;
		if(segments == 0) {
			if(goAgain) {
				addInitItem(r+1, s, {"playerName": i[r][s][item].playerName, "charName": i[r][s][item].charName, "turn": i[r][s][item].turn+1, "taken":false});
			}
		} else {
			console.log("Clock type turn finish");
			if(s+goAgain >= segments) {

				addInitItem(r+1, (s+goAgain)-segments, {"playerName": i[r][s][item].playerName, "charName": i[r][s][item].charName, "turn": i[r][s][item].turn+1, "taken": false});
			} else {
				addInitItem(r, s+goAgain, {"playerName": i[r][s][item].playerName, "charName": i[r][s][item].charName, "turn": i[r][s][item].turn+1, "taken": false});
			}
		}

		if(actionsRemaining(r,s) == 0) {
			console.log("Turn finished and no actions remaining in this segment.  Advancing Segment");
			advanceSegment(r,s);
		}
	} else {
		console.log(r + "|" + s + "|" + item + ": turn already taken");
	}
}

console.log("init system");
newInit(8);

console.log("adding players");
var r = addPlayer("nick", "turzol", "1.2.3.4", "#ccffaa", false);
r = addPlayer("sue", "susan", "4.3.2.1", "#cfacfa", false);
r = addPlayer("ken", "rakion", "1.1.1.1", "#bbbbbb", true);

console.log(players);



setInit("nick", "turzol", 6, currentRound);
setInit("ken", "rakion", 7, currentRound);
addInitReminder(2, 2, "ken", "", "Fireball!");
//setInit("susan", 1, currentRound);

printInit();
//console.log("----------------------------");

//finishTurn(0,1,0, true);
//finishTurn(0,1,1, true);
//finishTurn(0,6,0, 3);
//finishTurn(0,7,0, 1);
//finishTurn(0,1,1, 3);
//console.log("----------------------------");

//printInit();
//console.log("----------------------------");




function addInitItem(r, s, t) {
	if(initiative[r] == null) {
		initiative[r] = [];
	}

	if(i[r][s] == null) {
		initiative[r][s] = [];
	}

	//console.log("pushing into i[" + r + "][" + s + "]");
	//console.log(t);
	initiative[r][s].push(t);
}

function addInitReminder(r,s, player, character, note) {
	addInitItem(r,s, {"playerName": player, "charName": character, "note": note, "taken": false});
	//
}

function setInit(playerName, charName,segment,roundEnter) {
	var setValid = true;
	for(const r of initiative) {
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
    initiative = [];
}

function printInit() {
	for(j = 0; j < initiative.length; j++) {
		console.log("Round " + j)
		if(initiative[j] != null) {
			for(k = 0; k < initiative[j].length; k++) {
				console.log("Segment " + k);
				//console.log(i[j][k]);
				if(initiative[j][k]) {
					for(l = 0;l<i[j][k].length;l++) {
						console.log(j + "|" + k + "|" + l + ": ");
						console.log(initiative[j][k][l]);
					}
				}
			}
		}
	}
}

function actionsRemaining(r,s) {
	var retVal = 0;
	for(const item of initiative[r][s]) {
		if(!item.taken) {
			retVal++;
		}
	}
	return retVal;
}

function findNextSegment(r,s) {
	if(initiative[r][s] != null && initiative[r][s].length > 0) {
		console.log("Round: " + r + " : Segment " + s + " is not null and has items in it");
		return {"r": r, "s": s};

	} else {
		if(initiative[r] == null) {
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
	if(initiative[r][s][item] != null) {
		initiative[r][s][item].taken = true;
	}
}

function finishTurn(r,s,item,goAgain) {
	if(!initiative[r][s][item] != null && !initiative[r][s][item].taken) {
		initiative[r][s][item].taken = true;
		if(segments == 0) {
			if(goAgain) {
				addInitItem(r+1, s, {"playerName": initiative[r][s][item].playerName, "charName": initiative[r][s][item].charName, "turn": initiative[r][s][item].turn+1, "taken":false});
			}
		} else {
			console.log("Clock type turn finish");
			if(s+goAgain >= segments) {

				addInitItem(r+1, (s+goAgain)-segments, {"playerName": initiative[r][s][item].playerName, "charName": initiative[r][s][item].charName, "turn": initiative[r][s][item].turn+1, "taken": false});
			} else {
				addInitItem(r, s+goAgain, {"playerName": initiative[r][s][item].playerName, "charName": initiative[r][s][item].charName, "turn": initiative[r][s][item].turn+1, "taken": false});
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

module.exports = {
	addInitItem,
	addInitReminder,
	setInit,
	newInit,
	printInit,
	actionsRemaining,
	findNextSegment,
	advanceSegment,
	setTurnTaken,
	finishTurn
}
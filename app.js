var createError = require('http-errors');
var express = require('express');
var bodyParser = require("body-parser");
var session = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({'secret': 'farts niffer', 'resave': false, 'saveUninitialized':true}));


var initiative = [];
var segments = 0; //0 means 1 action per round (or D&D type). > 0 = clock type
var currentRound = 0;
var currentSegment = 0;



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



var users = [];
//{userName: 'user', isGM: false, ipAddress: '1.1.1.1', lastActionTime: 'timedate'}

var players = [
{"charName":"Rakion", "userName":"", "color":"#000000", "isGM": false},
{"charName":"Turzol", "userName":"", "color":"#000000", "isGM": false},
{"charName":"Svetlana", "userName":"", "color":"#000000", "isGM": false},
{"charName":"Morgar", "userName":"", "color":"#000000", "isGM": false},
]

var isDMChosen = false;


function isIPInSystem(ip) {
	let retVal = false;
	let userList = users.filter(user => user.ipAddress === ip);
	if(userList.length > 0) {
		console.log("IP list from users");
		//console.log(userList);
		retVal = true;

 	} else {
 		console.log("there are no IPs that match: " + ip + " in the system");
 	}
 	return retVal;
}

function ipHasUserName(ip) {
	let userName = users.filter(user => user.ipAddress === ip)[0].userName;
	return userName !== "";

}

function setUserForIP(ip, un) {
	users.filter(user => user.ipAddress === ip)[0].userName = un;
}

function addIPToUserList(ip) {
	console.log("Adding ip: " + ip + " to user list");
	//in the future look up prior IPs and try to match namesfrom prior sessions
	users.push({"userName": "", "isDM": false, "ipAddress": ip, "lastActionTime": Date.now()});
}

function un(ip) {
	return users.filter(user => user.ipAddress === ip)[0].userName;
}

function setDM(ip) {
	isDMChosen = true;
	users.filter(user => user.ipAddress === ip)[0].isDM = true;
}

function getGMPlayer() {

	let retVal = users.filter(player => player.isGM);
	if(retVal) {
		retVal = retVal[0];
	}
	//console.log(retVal);
	return retVal;
}

function playerHasChar(un) {
	let playersForChar = players.filter(player => player.userName === un);
	//console.log("checking if player has a character");
	//console.log(playersForChar);
	if(playersForChar.length == 0) {
		return false;
	} else {
		return true;
	}

}

function isCharacterChosen(charName) {
	let playerForChar = players.filter(player => player.charName === charName)[0].userName
	return playerForChar !== ""
}

function setCharPlayer(charName, userName) {
	players.filter(player => player.charName === charName)[0].userName = userName
}

function IPSecurityCheck(req, res, next) {
	if(req.params.ip === req.ip) {
		next();
	} else {
		console.log("passed IP doesn't match request ip");
		res.redirect("/");
	}
}

/*
app.route('/')
	.get(function(req, res) {
		console.log("in app.route");
		let GM = getGMPlayer();
		if(GM) {
			res.send("Looks like we have a DM already: " + GM.charName);
		} else {
			res.render('dmchooser.pug', {players: players});
		}	

	})
*/

//--------------------- CATCHALL ------------------- //
app.use(function(req, res, next) {
	console.log("anther catchall with no route");
	next();
})

//--------------------- MAIN ------------------- //
app.all('/', function(req, res, next) {
	console.log("User request from IP: " + req.ip);

	if(!isIPInSystem(req.ip)) {	
		console.log("IP is not in the system, adding and redirecting to edituser");
		addIPToUserList(req.ip);
	}

	if(ipHasUserName(req.ip)) {
		if(req.session.userName === undefined || req.session.userName === null || req.session.userName === "") {
			req.session.userName = un(req.ip);
			req.cookie("userName", req.session.userName);
		}
		next();
	} else {
		let cookieUserName = req.cookies.userName
		if(cookieUserName === undefined) {
			res.redirect("edituser/" + req.ip);
		} else {
			setUserForIP(req.ip, cookieUserName);
			req.session.userName = cookieUserName;
			next();
		}		
	}
})

app.get("/", function(req, res) {

	if(req.session.isDM) {
		console.log("rendering dmmain");
		let loggedOnUsers = players.filter(player => player.userName != "");

		res.render('dmmain', {'s': req.session, 'isDMChosen': isDMChosen, 'loggedOnUsers': loggedOnUsers, 'initiative': null});
	} else {
		if(!playerHasChar(req.session.userName)) {
			let unassignedPlayers = players.filter(player => player.userName === "");
			//res.render('charselect', {'unassignedPlayers': unassignedPlayers});
			res.render('charselect', {'unassignedPlayers': unassignedPlayers, 's': req.session, 'isDMChosen': isDMChosen});
		} else {
			console.log("rendering main");
			res.render('main', {'s': req.session, 'isDMChosen': isDMChosen});
		}
	}
})


//--------------------- EDITUSER ------------------- //
app.get("/edituser/:ip", function(req, res) {
	console.log("in EditUser.get");
	//res.send("EditUser for " + req.params.ip);
	res.render('edituser');

});

app.post("/edituser", function(req, res) {
	console.log("in EditUser.post");
	let un = req.body.userName;
	//let isDM = req.body.dmCheckBox;
	setUserForIP(req.ip, un);
	req.session.userName = un;
	res.cookie("userName", un);
	//console.log(users);
	res.redirect("/");
});


//--------------------- CLAIMDM ------------------- //
app.post("/claimdm", function(req, res) {
	if(!isDMChosen) {
		setDM(req.ip);
		req.session.isDM = true;
	}
	res.redirect("/");

})

//--------------------- RELEASEDM ------------------- //
app.post("/releasedm", function(req, res) {
	if(isDMChosen) {
		isDMChosen = false;
		req.session.isDM = false;
	}
	res.redirect("/");

})

//--------------------- CharacterSelections ------------------- //
app.post("/selectchar", function(req, res) {
	if(!isCharacterChosen(req.body.charName)) {
		//console.log(req.body.charName);
		setCharPlayer(req.body.charName, req.session.userName);
		req.session.charName = req.body.charName
	}
	res.redirect("/");
})

app.post("/releasechar", function(req, res) {
	setCharPlayer(req.session.charName, "");
	req.session.charName = "";
	res.redirect("/");
})



//--------------------- MAYBE REMOVE THIS ------------------- //
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("in 404 catchall");
  next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

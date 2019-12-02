var createError = require('http-errors');
var express = require('express');
var bodyParser = require("body-parser");

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

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

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

var users = [];
//{userName: 'user', isGM: false, ipAddress: '1.1.1.1', lastActionTime: 'timedate'}

var players = [
{"charName":"Rakion", "userName":"Ken", "color":"#000000", "isGM": false},
{"charName":"Turzol", "userName":"Nick", "color":"#000000", "isGM": false},
{"charName":"Svetlana", "userName":"Susan", "color":"#000000", "isGM": false},
{"charName":"Morgar", "userName":"Cullen", "color":"#000000", "isGM": false},
]

var isDMChosen = false;


function isIPInSystem(ip) {
	let retVal = false;
	let userList = users.filter(user => user.ipAddress === ip);
	if(userList.length > 0) {
		console.log("IP list from users");
		console.log(userList);
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
	users.push({"userName": "", "isGM": false, "ipAddress": ip, "lastActionTime": Date.now()});
}

function un(ip) {
	return users.filter(user => user.ipAddress === ip)[0].userName;
}

function getGMPlayer() {

	let retVal = users.filter(player => player.isGM);
	if(retVal) {
		retVal = retVal[0];
	}
	//console.log(retVal);
	return retVal;

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

	if(isIPInSystem(req.ip)) {
		console.log("IP is in system");
		if(ipHasUserName(req.ip)) {
			next();
		} else {
			res.redirect("edituser/" + req.ip);
		}
	} else {
		console.log("IP is not in the system, adding and redirecting to edituser");
		addIPToUserList(req.ip);
		res.redirect("edituser/" + req.ip);
	}

})

app.get("/", function(req, res) {
	console.log("in app.get");
	//res.send("Hello " + pn(req.ip));
	res.render('main', {un: un(req.ip), hasDM: isDMChosen});
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
	//console.log(users);
	res.redirect("/");
});


//--------------------- CLAIMDM ------------------- //
app.post("/claimdm", function(req, res) {

	
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

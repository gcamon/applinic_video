'use strict';

var express = require('express');
var path = require("path");

var bodyParser = require('body-parser');
var router = express.Router();
//var session = require('express-session');
//var passport = require('passport');
//var flash = require('connect-flash');
//var cookieParser = require("cookie-parser");
//var MongoDBStore = require('connect-mongodb-session')(session);
//var ExpressPeerServer = require('peer').ExpressPeerServer;
 


var configuration = function (app,model) {
  
	app.use('/assets',express.static(__dirname + '/public'));
	//middleware
	/*app.use(session({
	  secret: 'keyboard cat',
	  store: store,
	  resave: true,	  
	  saveUninitialized: true,
	  cookie: {
	  	httpOnly: true, 
	  	maxAge: 3600000 * 24,
	  	path: "/user"
	  } //secure: true will be set on the cookie when i this site is on https
	}));*/
	
	
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	//app.use(multer({dest: './uploads'}).any());
	
	
	/*app.use(function(req,res,next){
		if(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
		  res.redirect("https://" + req.headers.host + req.url);
		} else {
		  next();
		}		
	});*/

	
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');

	app.use('/',router);

}

module.exports = {
  configuration: configuration,
  router: router,	
}


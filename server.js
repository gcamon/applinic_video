"use strict";
var express = require('express'),      
  db = require('./model'),
  config = require('./config'),    
  route = require('./route'),
 
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  model = db(),
  
 
  mySocket = require("./socket"),
  streams = require("./streams")(),//this will be moved to another server later

  port = process.env.PORT || 4000;

 
 
var options = {
  debug: true
}


http.listen(port,function(){
    console.log('listening on *:' + port);
});


config.configuration(app,model);

route(model,io,streams); 

mySocket(model,io,streams);




//var a = "ede obinna".replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
//console.log(a)




  







"use strict";

var uuid = require("node-uuid");

module.exports = function(model,io,streams) {    
  io.sockets.on('connection', function(socket){  	   
	    console.log('a user connected');
	    var user = {};
	    /*socket.on('join', function (data) {
	    	user.isPresent = true; //use to check presence of user without hitting the database.
	      socket.join(data.userId);      
	      console.log("room created");
	    });



			//sending video or audio request
			socket.on("convseration signaling",function(req,cb){
				model.user.findOne({user_id:req.to},{set_presence:1,firstname:1,title:1},function(err,doc){
					if(err) throw err;
					if(doc.set_presence.general === true) {
						//{type:req.type,message:req.message,time:req.time}
						io.sockets.to(req.to).emit("receive signal",req);
					} else {
						var msg = doc.title + " " + doc.firstname + " is currently not available. Try later."
		    		cb({error: msg});
					}
				});			
			});

			//response to the video or audio reqquest.
			socket.on("signal response",function(data){
				data.message_id = Math.floor(Math.random() * 999999);
				io.sockets.to(data.to).emit("conversation status",data);
			});


			//in call directed to patients when doc enters call page emited from the front end.
			socket.on("in call",function(data){
				io.sockets.to(data.to).emit("calling",data);
			});

			//when patient is inside a call page the doctor is notified
			socket.on("in call connected",function(data){
				io.sockets.to(data.to).emit("patient in call connected",{status: true})
			});

			socket.on("call rejected",function(data){
				io.sockets.to(data.to).emit("user rejected calls",{status:"Call rejected!"})
			});

			///////

			//video logic this will be moved to a new server
			//sending video or audio request
			socket.on("convsersation signaling",function(req,cb){
				model.user.findOne({user_id:req.to},{set_presence:1,firstname:1,title:1},function(err,user){
					if(err) throw err;
					if(user.set_presence.general === true) {
						//{type:req.type,message:req.message,time:req.time}
						io.sockets.to(req.to).emit("receive request",{message: req.title + " " + 
							req.name + " requests for video call with you!",from: req.from});
						cb({message:"Video call request has been sent to " + user.title + " " + user.firstname})
					} else {
						var msg = user.title + " " + user.firstname + " is currently not available.Your request has been qeued for attendance."
		    			cb({message: msg});
					}
				});			
			});

			/*socket.on("conversation acceptance",function(details,cb){
				//will be modified to accomadate other chosen time
			
				switch(details.time){
					case "now":
					  var controlId = genRemoteId();
						var createUrl = "/user/cam/" + controlId;
						saveControlControl(createUrl,controlId,details);
						cb({controlUrl: createUrl});
						io.sockets.to(details.to).emit("video call able",{controlUrl: createUrl,message: details.title +
						 " " + details.name + " is waiting to have video conference with you!"});
					break;
					default:
					break;
				}
			})

			function genRemoteId() {
				return uuid.v1();
			}

			function saveControlControl(controlUrl,controlId,details) {
				var control = new model.control({
					controlId: controlId,
					controlUrl: controlUrl,
					streams: []
				});

				var date = new Date();
	      control.expirationDate = new Date(date.getTime() + 300000);
	      control.expirationDate.expires = 36000; //10 hours before the data is deleted.
				control.save(function(){});
			}

			socket.on("call reject",function(details){
				io.sockets.to(datails.to).emit("convserstion denied",details)
			})*/









			/////////////////////

		// to be moved to another server for video
		console.log('-- ' + socket.id + ' joined --');
    socket.emit('id', socket.id);

    socket.on('message', function (details) {
      var othersocket = io.sockets.connected[details.to];
      
      if (!othersocket) {
        return;
      }
        delete details.to;
        details.from = socket.id;
        othersocket.emit('message', details);
    });
      
    /*socket.on('readyToStream', function(options) {
      console.log('-- ' + socket.id + ' is ready to stream --');      
      streams.addStream(socket.id, options.name); 
    });*/

    // gets te control to join a room
    socket.on("control join",function(control,cb){
    	console.log("checking----------")
    	console.log(control);
    	socket.join(control.control);//control.joins a roo
    	cb(control);
    	streams.addStream(socket.id,control.name,control.control,model)
    })

    socket.on('readyToStream', function(options,cb) {
      console.log('-- ' + socket.id + ' is ready to stream --');
      //search database to see which control this socket belong to.
      streams.addStream(socket.id, options.name, options.controlId,model);
      socket.join(options.controlId); //create a room for common sites using one control.
      //io.sockets.to(options.controlId).emit("new stream added",{message:"new stream",controlId:options.controlId});
      cb({controlId:options.controlId})
    });

    socket.on("init reload",function(data){
    	console.log(data.message)
    	io.sockets.to(data.controlId).emit("reload streams",{status:true,name:data.names})
    })
    
    socket.on('update', function(options) {
      streams.update(socket.id, options.name);
    });

    function leave() {
      console.log('-- ' + socket.id + ' left --');
      streams.removeStream(socket.id);
    }

    socket.on('disconnect', leave);
    socket.on('leave', leave);

  });

  
 }
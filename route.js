"use strict";
var config = require("./config");
var router = config.router;

module.exports = function(model,io,streams) {
  router.get("/",function(req,res){
    res.render("index");
  })

  router.get("/user/:id",function(req,res){
    console.log(req.params)
    model.user.findOne({user_id: req.params.id},{firstname:1,lastname:1,title:1,_id:0,name:1,type:1},function(err,data){
      if(err) throw err;
      console.log(data)
      res.send(data);
    })
  })

  router.get("/user/cam/:controlId/:userId/:type",function(req,res){
    if(req.params.type === "Doctor"){
      res.render("video-chat",{"person":{controlId: req.params.controlId,userId: req.params.userId}});
    } else {
      res.render("video-chat2",{"person":{controlId: req.params.controlId, userId: req.params.userId}});
    }   
    
  });

   
   router.get('/user/streams.json/:controlId',function(req,res){
     if(req.user) {
      streams.getStreamToControl(req.params.controlId,model,function(streamList){
        var data = (JSON.parse(JSON.stringify(streamList)));
        console.log(data)    
        res.status(200).json(data);
      });//streams.getStreams();     
     } else {
      res.end("Please login before you can access streams.")
     }
  });

}
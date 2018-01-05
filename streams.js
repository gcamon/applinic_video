module.exports = function() {
  /**
   * available streams 
   * the id value is considered unique (provided by socket.io)
   */
  var streamList = [];

  var controls = {};

  /**
   * Stream object
   */

   /*
   todo keep  control in  database. Creat a json object with the following field, Name of control, id of control, streamlist of Array of objects.,
   */
  var Stream = function(id, name) {
    this.name = name;
    this.id = id;
  }

  return {
    /*addStream : function(id, name,) {
      var stream = new Stream(id, name);
      streamList.push(stream);
    },*/

    addStream : function(id, name, controlId,model) {
            
      //controlwill be deleted after 10 hour as ttl was set for every instance of control that was initiated on socket.js
      model.control.findOne({controlId: controlId}).exec(function(err,control){
        console.log(control);
        var stream = new Stream(id, name, controlId);
        if(err) throw err;
        if(control){ 
          var elemPos = control.streams.map(function(x){return x.id}).indexOf(id);
          if(elemPos === -1)         
            control.streams.push(stream);

          control.save(function(err,info){
            console.log("streams save!")
          })
        }


      });
      /*if(controls[controlId]) {
        controls[controlId].push(stream);
      } else {
        this.addControl(controlId)
      }*/
    },

    removeStream : function(id) {
      var index = 0;
      while(index < streamList.length && streamList[index].id != id){
        index++;
      }
      streamList.splice(index, 1);
    },

    // update function
    update : function(id, name) {
      var stream = streamList.find(function(element, i, array) {
        return element.id == id;
      });
      stream.name = name;
    },

    

    addControl: function(controlId){
      //check to see if control does not exist then add it 
      //do database search to find a control the requested site belongs to.
      //if control is found attach the control id to the controls object properties  
      if(!controls.hasOwnProperty(controlId)) {
        controls[controlId] = [];
      }
      
    },

    getStreamToControl: function(controlId,model,cb) { 
      model.control.findOne({controlId: controlId},{streams:1},function(err,data){
        if(err) throw err;
        //var list = data.streams || [];
        var list;
        if(data){
          list = data.streams;
        } else {
          list = [];
        }
        cb(list); //use data.streams
      })
      /*var controlStreamList = (controls.hasOwnProperty(controlId)) ? controls[controlId] : addControl(controlId);
      if(controlStreamList) {
        return controlStreamList;
      }*/
    },

  }
};

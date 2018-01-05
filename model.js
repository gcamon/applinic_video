'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var dbURL = process.env.MONGODB_ADDON_URI ||  "mongodb://127.0.0.1:27017/medicalmull";//"mongodb://127.0.0.1:27017/medicalmull";
mongoose.connect(dbURL);
mongoose.connection.on("error",function(err){
    console.log(err)
});

var Schema = mongoose.Schema;

var myModel = function () {
	
	var userSchema = Schema({
		firstname: String,
		lastname: String,
	});

	var controlSchema = Schema({
		expirationDate: {
			type: Date,
			expires: Number
		},		
		createdAt: {
			type: Date,
			expires: Number
		},
		controlId: String,		
		controlUrl: String,
		streams: Array
	},{
		collections: "controlinfos"
	});
	

	//models
	var models = {};
	models.user = mongoose.model('userinfos', userSchema);
	models.control = mongoose.model("controlinfos",controlSchema);
	return models		
}

module.exports = myModel;














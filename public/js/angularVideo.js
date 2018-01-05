(function(){
	var app = angular.module('rtcVideo', [],
		function($locationProvider){$locationProvider.html5Mode(true);}
    );
		var client = new PeerManager(name);
		var mediaConfig = {
        audio:true,
        video: {
					mandatory: {},
					optional: []
        }
    };

        /*
    var mediaConfig = {
        audio:true,
        video: {
        	width: {max: 500},
        	height: {max: 500}
        }
    };

    */

    var storage = window.localStorage.getItem("resolveUser");
		var user = JSON.parse(storage);



    app.factory("localManager",["$window",function($window){
		  return {
		    setValue: function(key, value) {
		      $window.localStorage.setItem(key, JSON.stringify(value));
		    },
		    getValue: function(key) {       
		      return JSON.parse($window.localStorage.getItem(key)); 
		    },
		    removeItem: function(key) {
		      $window.localStorage.removeItem(key);
		    }
		  };
		}]);

    app.factory('camera', ['$rootScope', '$window', function($rootScope, $window){
    	var camera = {};
    	camera.preview = $window.document.getElementById('localVideo');
    	//Get the camera stream and attach to be passed onto a web element
    	camera.start = function(){
				return requestUserMedia(mediaConfig)
				.then(function(stream){						
					attachMediaStream(camera.preview, stream);
					client.setLocalStream(stream);
					camera.stream = stream;
					$rootScope.$broadcast('cameraIsOn',true);
				})
				.catch(Error('Failed to get access to local media.'));
		  };
    	camera.stop = function(){
    		return new Promise(function(resolve, reject){			
				try {
					//camera.stream.stop() no longer works
					
					var track =  camera.stream.getTracks();
          for( var i = 0; i < track.length; i++ ){
	          track[i].stop();
	        }
					camera.preview.src = '';
					resolve();
				} catch(error) {
					reject(error);
				}
    		})
    		.then(function(result){
    			$rootScope.$broadcast('cameraIsOn',false);
    		});	
		};
		return camera;
    }]);

	   /*app.config(function($routeProvider){
			  $routeProvider

			  .when("/",{
			  	templateUrl: "/assets/pages/site.html"
			  })

			  .when("/cam/:id",{
			  	templateUrl: "/assets/pages/site.html",
			  })

			  .when("/cam/:id/local-streams",{
			  	templateUrl: "/assets/pages/local-remote.html",
			  	//controller: "siteRemoteStreamsController"
			  })
		 });*/

  

	app.controller('RemoteStreamsController', ["$scope","$rootScope",'camera', '$location', '$http','$window',
	 function($scope,$rootScope,camera, $location, $http, $window){
		var rtc = this;
		rtc.remoteStreams = [];
		//var name = "Doctor" //gets name of doctor in this case
		function getStreamById(id) {
	    for(var i=0; i<rtc.remoteStreams.length;i++) {
	    	if (rtc.remoteStreams[i].id === id) {return rtc.remoteStreams[i];}
	    }
		}
		var control = {}

		var count = 0;		

		rtc.siteLink = function(controlId, id, name, title, firstname){
			if(count < 1) {
				control.controlId = controlId;
				//join a room
	    	rtc.name = title + " " + firstname + " " + name  || 'Guest';
				

				/*var url = "/user/" + id;
				$http({
		      method  : 'GET',
		      url     : url,
		      headers : {'Content-Type': 'application/json'} 
		     })
		    .success(function(user) {
		     if(user){
		     	 rtc.name = user.title + " " + user.firstname + " " + user.lastname  || 'Guest';
		     } else {
		     	 window.location.href = "https://applinic.com/login";
		     }

		     client.controlJoin(controlId,rtc.name); 
				 return $window.location.host + "/user/cam/" + controlId;
		    });*/
		    count++;    
	    }              
			
		}

		rtc.loadData = function () {
			// get list of streams from the server
			
		
			var url = '/user/streams.json/' + control.controlId;
			
			$http.get(url).success(function(data){
				// filter own stream
				console.log(data)
				var streams = data.filter(function(stream) {
			      return stream.id != client.getId();
			    });
			    // get former state
			    //starts from one for remote streams
			    for(var i=0; i<streams.length;i++) {
			    	var stream = getStreamById(streams[i].id);
			    	streams[i].isPlaying = (!!stream) ? stream.isPLaying : false;
			    	//rtc.view(streams[i])
			    }			    
			    // save new streams
			    console.log(data)
			    $rootScope.connections = streams;
			    rtc.remoteStreams = streams;
			});
		};

		rtc.view = function(stream){
			client.peerInit(stream.id,stream.name);
			stream.isPlaying = !stream.isPlaying;
		};
		rtc.call = function(stream){
			/* If json isn't loaded yet, construct a new stream 
			 * This happens when you load <serverUrl>/<socketId> : 
			 * it calls socketId immediatly.
			**/
			if(!stream.id){
				stream = {id: stream, isPlaying: false};
				rtc.remoteStreams.push(stream);
			}
			if(camera.isOn){
				client.toggleLocalStream(stream.id);
				if(stream.isPlaying){
					client.peerRenegociate(stream.id);
				} else {
					client.peerInit(stream.id);
				}
				stream.isPlaying = !stream.isPlaying;
			} else {
				camera.start()
				.then(function(result) {
					client.toggleLocalStream(stream.id);
					if(stream.isPlaying){
						client.peerRenegociate(stream.id);
					} else {
						client.peerInit(stream.id);
					}
					stream.isPlaying = !stream.isPlaying;
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};

		//initial load
		//rtc.loadData();
    	/*if($location.url() != '/'){
      		rtc.call($location.url().slice(1));
    	};*/


    /*client.reloadFn(function () {
    	rtc.loadData(); //automaticall call the refresh
    });*/
		var controllerSocket = client.getSocketForController();

    controllerSocket.on("reload streams",function(data){    	
    	var message = data.name ? data.name + " stream is availble." : "Partner stream is now available."
    	console.log(data)
    	var decide = confirm(message);
    	if(decide) {
    		rtc.loadData();
    	} else {
    		alert("Video call aborted!");
    		//send emit to stop video to the other peer.
    	}
    	
    })
	}]);

	app.controller('LocalStreamController',['camera','$rootScope', '$scope', '$http','localManager','$window','$location',
	 function(camera,$rootScope, $scope, $http, localManager, $window, $location){
		var localStream = this;
		var user = {};
		//localStream.name = "guest" //user.title + " " + user.firstname + " " + user.lastname  || 'Guest';
		localStream.link = '';
		localStream.cameraIsOn = false;
		var count = 0;
		localStream.getUser = function(id,firstname,title,name,type){
			if(count < 1) {
				localStream.name = title + " " + firstname + " " + name  || 'Guest';
				user.typeOfUser = type;
				//To be used when database server is restored.
				/*var url = "/user/" + id;
				$http({
		      method  : 'GET',
		      url     : url,
		      headers : {'Content-Type': 'application/json'} 
		     })
		    .success(function(user) {
		     if(user){
		     	 localStream.name = user.title + " " + user.firstname + " " + user.lastname  || 'Guest';
		     	 user.typeOfUser = user.type;
		     	 localStream.toggleCam();
		     } else {
		     	 window.location.href = "https://applinic.com/login";
		     }
		    });*/
		    count++;    
	    }              
		}

		$scope.goToDashbaord = function(){	//remember to change the for the videoserver to point to applinic main
				switch(user.typeOfUser) {
					case "Doctor":
							window.location.href = "https://applinic.com/user/doctor";
					break;
					case "Patient":
							window.location.href = "https://applinic.com/user/patient";
					break;
					case "Pharmacy":
							window.location.href = "https://applinic.com/user/pharmacy";
					break;
					case "Laboratory":
							window.location.href = "https://applinic.com/user/laboratory";
					break;
					case "Radiology":
							window.location.href = "https://applinic.com/user/radiology";
					break;
				}		
		
		}

		var saveControlId = {};
		var path = $location.path();
		var newPath = path + "/local-streams";
		$scope.allLocalStreams = function() {
			$location.path(newPath);
		}

		$scope.$on('cameraIsOn', function(event,data) {
  		$scope.$apply(function() {
	    	localStream.cameraIsOn = data;
	    });
		});

		localStream.getControlId = function(id){
			console.log(id)
			saveControlId.id = id;		
		}

		localStream.toggleCam = function(){
			if(localStream.cameraIsOn){
				localManager.removeItem("username");
				camera.stop()
				.then(function(result){
					client.send('leave');
	    		client.setLocalStream(null);
				})
				.catch(function(err) {
					console.log(err);
				});
			} else {
				camera.start()
				.then(function(result) {
					localStream.link = $window.location.host + '/' + client.getId();
					if(localManager.getValue("username") !== "Guest" || localManager.getValue("username") !== ""){
						localManager.setValue("username",localStream.name);
					}				
					client.send('readyToStream', { name: localStream.name,controlId: saveControlId.id });
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};

		

	}]);

	app.controller("VideoDiagnosisController",["$rootScope","$scope","$location","$window","$http","localManager","templateService","Drugs","$resource",
  function($rootScope,$scope,$location,$window,$http,localManager,templateService,Drugs,$resource){
  $scope.treatment = {};
  var patient = {};  
  console.log($rootScope.connections);
  var random = Math.floor(Math.random() * 999999999999);
  patient.id = localManager.getValue("personToCall");
  var getPatientData = $resource("/user/doctor/specific-patient");
  getPatientData.get(patient,function(data){
    $scope.patientInfo = data;
    patient.prescriptionId = random;
    patient.patient_id = patient.id;    
    patient.firstname = $scope.patientInfo.firstname;
    patient.lastname = $scope.patientInfo.lastname;
    patient.gender = $scope.patientInfo.gender;
    patient.age = $scope.patientInfo.age;
    patient.address = $scope.patientInfo.address;
    patient.city = $scope.patientInfo.city;
    patient.country = $scope.patientInfo.country;
    patient.patient_profile_pic_url = $scope.patientInfo.profile_pic_url;
    patient.lab_analysis = $scope.patientInfo.lab_analysis;
    patient.scan_analysis = $scope.patientInfo.scan_analysis;
    patient.allergy = $scope.patientInfo.allergy;
    patient.title = $scope.patientInfo.title;
    patient.sender = "doctor";
  });
   
    

    //creates drug object for the ng-repeat on the view.
    $scope.drugs = Drugs;
    var drug_name;
    var index;
    $scope.getDrug = function(drugName){
      drug_name = drugName;
      if($scope.drugList.length === 1)
        $scope.drugList[0].drug_name = drugName;
      if( $scope.drugList.length > 1)
        $scope.drugList[index].drug_name = drugName;
    }

    var drug = {};
    var count = {};
    count.num = 1;
    drug.sn = count.num;
    $scope.drugList = [drug]; // this populates the array for the view ng-repeat. this is the prescription body as the doctor writes it.

    $scope.addDrug = function(){  
      var newDrug = {};         
      count.num++;
      newDrug.sn = count.num;
      $scope.drugList.push(newDrug);
      index = $scope.drugList.length - 1;     
      console.log("static")
      console.log($scope.drugList);
      
    }

    $scope.removeDrug = function(){
      if(count.num > 1){
        $scope.drugList.pop(drug);
        count.num--;
        index--;
      }
    }
    var finalBody;
    $scope.$watch("drugList",function(newVal,oldVal){
      patient.prescriptionBody = newVal;// adds prescription body to the prescription object as the doctor 
    //prepares to send it to the back end.
    },true);  


    $scope.toPatient = function(){
      //doctor creates the prescription object and sends it the the back end. url is "patient/forwarded-prescription", other informations that
      //comes with the prescription object added to the prescription object in the backend.
      templateService.holdPrescriptionToBeForwarded = patient;
      $http({
        method  : 'PUT',
        url     : "/user/patient/forwarded-prescription",
        data    : patient,
        headers : {'Content-Type': 'application/json'} 
        })
      .success(function(data) {      
        console.log(data);
        alert(data);
      });
      
    }

    $scope.toPharmacy = function(){     
       $scope.treatment.prescription_id = patient.prescriptionId; // id to identify prescription in a session if one is written.
       $scope.treatment.patient_id = patient.id;
       $scope.treatment.typeOfSession = "video chat";
       $http({
        method  : 'POST',
        url     : "/user/doctor/patient-session",
        data    : $scope.treatment,
        headers : {'Content-Type': 'application/json'} 
        })
      .success(function(data) {
        if(data)   
          alert("session created!!");
      });

      templateService.holdPrescriptionToBeForwarded = patient;
      $location.path("/search/pharmacy");
    }

    $scope.isAppointment = false;
    $scope.submitSession = function(){
      if($scope.isAppointment === false){
        $scope.isAppointment = true;
        viewed = true;
        var date = new Date();
        $scope.treatment.date = date;      
        $scope.treatment.patient_id = patient.id;
        $scope.treatment.typeOfSession = "video chat";      
        $scope.treatment.appointment = {};
        $scope.bookAppointment = function(){          
          $scope.treatment.appointment.firstname = patient.firstname;
          $scope.treatment.appointment.lastname = patient.lastname;
          $scope.treatment.appointment.title = patient.title;
          $scope.treatment.appointment.profilePic = patient.patient_profile_pic_url;
          $http({
            method  : 'POST',
            url     : "/user/doctor/patient-session",
            data    : $scope.treatment,
            headers : {'Content-Type': 'application/json'} 
            })
          .success(function(data) {
            if(data)   
              alert("session created!!");
          });
        }
      } else {
        $scope.isAppointment = false;
      }
    }
}]);
})();


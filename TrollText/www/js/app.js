// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var app = angular.module('starter', ['ionic', 'ngCordova', 'firebase'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html'
  });
  
  $stateProvider.state('contact', {
    url: '/contact',
    templateUrl: 'templates/contact.html'
  });
  
  $stateProvider.state('chat', {
    url: '/chat',
    templateUrl: 'templates/chat.html'
  });
  
  
})

app.controller("AppCtrl", function($scope, $state, $cordovaContacts, $cordovaDevice, $ionicHistory, $firebaseObject, $ionicPopup, $ionicScrollDelegate) {
  document.addEventListener("deviceready", function () {

    if (window.localStorage && !window.localStorage.getItem('firstRunFinished'))  {
      // An alert dialog
         var alertPopup = $ionicPopup.alert({
           title: 'Notice',
           template: "Please note, your number may be used to Troll other people. In order to send messages coming from an unknown number, you must donate 1 SMS for someone else to troll their friends.  Normal text message charges still apply."
         });
         alertPopup.then(function(res) {});
       window.localStorage.setItem('firstRunFinished',true);
    }

    var ref = new Firebase("https://trolltext.firebaseio.com/");
    var troll = Troll(ref);
    var uuid = $cordovaDevice.getPlatform() + $cordovaDevice.getUUID();

    $scope.messages = $firebaseObject(ref.child('messages').child(uuid));
      
    $scope.getContactList = function() {
  	  	  
  	  navigator.contacts.pickContact(function(contact){
  		$scope.contactName = getName(contact);	
  		$scope.contacts = contact.phoneNumbers;
  		$scope.$apply();
      $state.go('contact');
  	},function(err){
      $state.go('home');
  	});
    }

    $scope.processContact = function(number, name) {
  	$scope.chat = $firebaseObject(ref.child('messages').child(uuid).child(number));
  	$scope.number = number;
  	$scope.name = name;
  	troll.get_suggestions($scope);
    setTimeout(function(){ $ionicScrollDelegate.scrollBottom(true); }, 1000);
  	$state.go('chat');
    }
    
    $scope.sendMessage = function() {
  	  troll.send_message($scope.messageToSend, $scope.number, $scope.name, uuid, sendSMS);
      setTimeout(function(){ $ionicScrollDelegate.scrollBottom(true); }, 1000);
      troll.get_suggestions($scope);
    }
    
  });

}).filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
}).filter('myLimitTo', [function(){
    return function(obj, limit){
        var keys = Object.keys(obj);
        if(keys.length < 1){
            return [];
        }

        var ret = new Object,
        count = 0;
        angular.forEach(keys, function(key, arrayIndex){
            if(count >= limit){
                return false;
            }
            ret[key] = obj[key];
            count++;
        });
        return ret;
    };
}]);

function getName(c) {
	var name = c.displayName;
	if(!name || name === "") {
		if(c.name.formatted) return c.name.formatted;
		if(c.name.givenName && c.name.familyName) return c.name.givenName +" "+c.name.familyName;
		return "Nameless";
	}
	return name;
}

function sendSMS(number, text){
        SMS.sendSMS(number, text, function(){console.log("Succesfully sent msg " + text + "to: " + number)}, 
                    function(str){console.log("Error while sendimg msg: " + str);})
}

// TODO: On app startup, we should list latest SMS and see if any were responses to previous msgs. 
// Ideally the app should be a service running on the background. To be implemented later...
function listSMS(){
                    if(SMS) SMS.listSMS({}, function(data){})
                  }

// TODO: Change event listener to report to the app/firebase for response processing
function startWatch(){ 
  SMS.startWatch(function(){
		  console.log('watching', 'watching started');
		  document.addEventListener('onSMSArrive', function(e){
				  var sms = e.data;
				  console.log('SMS arrived, content: ' + JSON.stringify( sms ));
		  });
  }, function(){
		  console.log('failed to start watching');
	 });
}

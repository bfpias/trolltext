// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'ngCordova'])

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
  })
  
  $stateProvider.state('contact', {
    url: '/contact',
    templateUrl: 'templates/contact.html'
  })
  
})

app.controller("AppCtrl", function($scope, $state, $cordovaContacts) {
 
  $scope.getContactList = function() {
	  
	  $state.go('contact');
	  
	  navigator.contacts.pickContact(function(contact){
		console.log('The following contact has been selected:' + JSON.stringify(contact.phoneNumbers));
		$scope.contactName = getName(contact);	
		$scope.contacts = contact.phoneNumbers;
		$scope.$apply();
	},function(err){
		console.log('Error: ' + err);
	});
  }

  $scope.processContact = function(number, name) {
	$scope.messages.(number + " " + name);
	$state.go('home');
  }
  

}).filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

function getName(c) {
	var name = c.displayName;
	if(!name || name === "") {
		if(c.name.formatted) return c.name.formatted;
		if(c.name.givenName && c.name.familyName) return c.name.givenName +" "+c.name.familyName;
		return "Nameless";
	}
	return name;
}

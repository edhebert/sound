/* Titleist Audio Analysis Software 
 *
 * Written as a Final Project for Harvard CSCI-E3
 * Ed Hebert
 * May 2015
 * ehebert@fas.harvard edu
 *
 * This code makes use of AngularJS, P5.JS and P5.sound libraries for audio capture and analysis tools
 * http://p5js.org
 */

// main sound app, "titleistSound"
var titleistSound = angular.module('titleistSound', [
  'ngRoute', 
  'ngAnimate',
  'appControllers',
  'angular-p5'
]);

// ROUTES 
titleistSound.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/capture', {
        templateUrl: 'partials/capture.html',
        controller: 'SoundController'
    }).
    otherwise({
        redirectTo: '/capture'
    })
}]);

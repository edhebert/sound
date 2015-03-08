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

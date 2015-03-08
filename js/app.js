var titleistSound = angular.module('titleistSound', [
  'ngRoute', 
  'ngAnimate',
  'appControllers',
  'angular-p5'
]);

// ROUTES 
titleistSound.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/list', {
        templateUrl: 'partials/list.html',
        controller: 'SoundController'
    }).
    otherwise({
        redirectTo: '/list'
    })
}]);

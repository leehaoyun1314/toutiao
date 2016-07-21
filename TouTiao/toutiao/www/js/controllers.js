angular.module('starter.controllers', [])
    .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {
        $http.get('http://localhost:8888/').success(function (data, status, header, config) {
            $scope.news = data;
        });
    }]).controller('VideoCtrl', ['$scope', function ($scope) {
        $scope.content = 'Hello, Video !';
    }]);
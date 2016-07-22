﻿angular.module('starter.controllers', [])
    .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {
        $http.get('http://localhost:8888/?tag=__all__&ac=wap&item_type=4&count=20&format=json&list_data_v2=1&min_behot_time=1469082377&ad_pos=4&ad_gap=6&csrfmiddlewaretoken=3a770f3aa241096858431a925a15d4e0').success(function (data, status, header, config) {
            $scope.news = data;
        });
    }]).controller('VideoCtrl', ['$scope', function ($scope) {
        $scope.content = 'Hello, Video !';
    }]).controller('DetailCtrl', ['$scope', '$stateParams', '$http', function ($scope, $stateParams, $http) {
        var itemUrl = $stateParams.url;
        console.log(itemUrl);
        if (itemUrl.substring(0, 1) == 'i') {
            itemUrl = 'item/' + itemUrl.substring(1) + '/';
        }
        $http.get('http://localhost:8888/' + itemUrl).success(function (data, status, header, config) {
            $scope.news = data;
        });
    }]);
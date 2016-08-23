angular.module('starter.controllers', [])
    .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {
        $http.get('http://localhost:8888/?tag=__all__&ac=wap&item_type=4&count=20&format=json&list_data_v2=1&min_behot_time=1471270864&ad_pos=4&ad_gap=6&as=A1F5B72B910D022&cp=57B11DE022F24E1&csrfmiddlewaretoken=ac2f13c14d0b214cbd81db0771088f30').success(function (data, status, header, config) {
            $scope.news = data;
        });
    }]).controller('VideoCtrl', ['$scope', function ($scope) {
        $scope.content = 'Hello, Video !';
    }]).controller('DetailCtrl', ['$scope', '$stateParams', '$http', '$sce', function ($scope, $stateParams, $http, $sce) {
        var itemUrl = $stateParams.url;
        if (itemUrl.substring(0, 1) == 'i') {
            itemUrl = 'item/' + itemUrl.substring(1);
        }
        $http.get('http://localhost:8888/' + itemUrl).success(function (data, status, header, config) {
            for (var index = 0, length = data.length; index < length; index++) {
                data[index].src = $sce.trustAsHtml(data[index].src);
            }
            $scope.news = data;
        });
    }]);
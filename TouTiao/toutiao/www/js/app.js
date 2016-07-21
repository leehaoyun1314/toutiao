angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
    .run(['$ionicPlatform', function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    }])
    .config(['$ionicConfigProvider', function ($ionicConfigProvider) {
        //$ionicConfigProvider.platform.ios.tabs.style('standard');
        //$ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        //$ionicConfigProvider.platform.android.tabs.position('bottom');

        //$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('left');

        //$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        //$ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
    }])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('home', {
                cache: false,
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).state('video', {
                cache: false,
                url: '/video',
                templateUrl: 'templates/video.html',
                controller: 'VideoCtrl'
            });
    }]);
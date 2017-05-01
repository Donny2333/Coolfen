/**
 * Created by Donny on 2015/9/23.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.router', []);
  angular.module('CoolfenMobileApp.directives', []);
  angular.module('CoolfenMobileApp.services', []);
  angular.module('CoolfenMobileApp.controllers', []);
  angular.module('CoolfenMobileApp.string', []);

  angular.module('CoolfenMobileApp', [
    'ionic',
    'ngStorage',
    'angular-cache',
    'CoolfenMobileApp.router',
    'CoolfenMobileApp.directives',
    'CoolfenMobileApp.services',
    'CoolfenMobileApp.controllers',
    'CoolfenMobileApp.string',
    'ngCordova',
    'ui.bootstrap.datetimepicker',
    'ngIOS9UIWebViewPatch',
    'ionic-toast',
    'SignalR',
    'countTo'
  ])

    .config(['$ionicConfigProvider', '$httpProvider',
      function ($ionicConfigProvider, $httpProvider) {
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back').previousTitleText(false);

        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.headers.post["Content-Type"] = "application/json";

      }])

    .run(['$ionicPlatform', '$localStorage', '$state', '$rootScope', '$timeout', '$ionicHistory', '$cordovaToast',
      function ($ionicPlatform, $localStorage, $state, $rootScope, $timeout, $ionicHistory, $cordovaToast) {
        $ionicPlatform.ready(function () {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
          }
          if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
          }
          if ($localStorage.passedIntro) {
            $state.go("app.home");
          } else {
            $state.go("intro");
          }
        });
        $ionicPlatform.on("resume", function () {
          console.log("resume");
          $rootScope.$broadcast('resume');
        });
        //双击退出
        $ionicPlatform.registerBackButtonAction(function (e) {
          if ($rootScope.backButtonPressedOnceToExit) {
            ionic.Platform.exitApp();
          }
          else if ($ionicHistory.backView()) {
            $ionicHistory.goBack();
          } else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showShortBottom('再按一次退出');
            setTimeout(function () {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }
          e.preventDefault();
          return false;
        }, 101);
      }])
})();

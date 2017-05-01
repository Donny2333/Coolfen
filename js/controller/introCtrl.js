/**
 * Created by feng on 2015/10/26.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('IntroCtrl', ['$scope', '$rootScope', '$state', '$ionicSlideBoxDelegate', '$localStorage', '$timeout', '$ionicHistory',
      function ($scope, $rootScope, $state, $ionicSlideBoxDelegate, $localStorage, $timeout, $ionicHistory) {
        $scope.slideHasChanged = function (index) {
          $timeout(function () {
            $scope.slideIndex = index;
          }, 1000)
        };

        $scope.reportEvent = function (event) {
          if ($scope.slideIndex == 2) {
            $timeout(function () {
              goHome();
            })
          }
        };

        $scope.startApp = function () {
          goHome();

          // 显示新手引导页
          $rootScope.$broadcast('refreshGuideData', {guide0: false});
        };

        function goHome() {
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
          });

          $localStorage.passedIntro = true;
          $state.go("app.home");
        }

      }])
})();

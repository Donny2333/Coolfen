/**
 * Created by SF002 on 2015/10/10.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('AboutCtrl', ['$scope', 'STRING', 'user','$cordovaInAppBrowser','$ionicHistory',
      function ($scope, STRING, user, $cordovaInAppBrowser, $ionicHistory) {
        //$scope.$on('$ionicView.beforeEnter', function () {
        //  $scope.tabs.isHide = true;
        //});
        $scope.vm = {};
        $scope.vm.version = STRING.APP_VERSION.RELEASE;

        //链接
        var options = {
          location: 'no',    // 地址栏
          clearcache: 'no',
          toolbar: 'yes',
          closebuttoncaption: '退出'
        };
        $scope.onWeiXin = function () {
          $cordovaInAppBrowser.open('http://mp.weixin.qq.com/s?__biz=MzA4OTg4MDY2OA==&mid=214957333&idx=1&sn=' +
          'b078d33295dad03ebd71ce8fac97704d&scene=1&from=singlemessage&isappinstalled=0#rd ', '_blank', options)
        }
        $scope.onWeiBo = function () {
          $cordovaInAppBrowser.open('http://weibo.com/coolfen', '_blank', options)
        }

        $scope.onEmail = function () {
          $cordovaInAppBrowser.open('http://coolfen.com', '_blank', options)
        }

        $scope.myGoBack = function() {
          $ionicHistory.goBack();
        };

      }])
})();

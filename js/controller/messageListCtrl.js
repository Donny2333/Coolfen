/**
 * Created by Donny on 2015/10/19.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('messageListCtrl', ['$scope', '$cordovaInAppBrowser', '$rootScope', '$timeout', '$state', '$ionicLoading', 'Auth', 'Message', 'Card', 'user', 'Toast',
      function ($scope, $cordovaInAppBrowser, $rootScope, $timeout, $state, $ionicLoading, Auth, Message, Card, user, Toast) {
        $scope.messageList = [];
        $scope.query = {
          searching: true
        };

        //$scope.goHome = function () {
        //  //user.goHome();
        ////  window.history.go('app.home');
        ////  window.history.back(-1);
        //};

        $scope.goBack = function () {
          $state.go('app.home');
        };

        // 查看消息
        $scope.click = function (index) {
          $state.go('app.messageDetail', {id: index});
        };

        // 删除消息
        $scope.deleteMessage = function (index) {
          Message.deleteMessageBox(index);
        };

        // 每次进入页面就从后台拉取最新消息
        $scope.$on("$ionicView.beforeEnter", function (event, args) {
          init();
        });

        function init() {
          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
            showBackdrop: false
          });

          $scope.query.searching = true;

          Message.getMessageList().then(function (data) {
            $scope.messageList = data;
          })
            .finally(function () {
              $ionicLoading.hide();
              $scope.query.searching = false;
            })
        }
      }])
}());

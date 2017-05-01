/**
 * Created by SF002 on 2015/11/18.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('FeedbackCtrl', ['$scope', '$ionicLoading', 'Merchant', 'Toast', '$ionicHistory',
      function ($scope, $ionicLoading, Merchant, Toast, $ionicHistory) {
        $scope.info = {};

        $scope.onSend = function () {
          if (_.isUndefined($scope.info.msg) || _.isEmpty($scope.info.msg)) {
            Toast.show('反馈内容不能为空！');
            return;
          }

          var json = {
            UserCardID: '0',
            Suggest: $scope.info.msg
          };

          Merchant.saveFeedback(json).then(function (data) {
            Toast.show(data);
          }, function (err) {
            Toast.show(err);
          })

        }

        $scope.myGoBack = function() {
          $ionicHistory.goBack();
        };
        
        
      }])
}());

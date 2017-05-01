/**
 * Created by Donny on 2015/10/19.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('messageDetailCtrl', ['$scope', '$stateParams', '$timeout', '$state', '$ionicLoading', 'Merchant', 'Message', '$ionicHistory',
      function ($scope, $stateParams, $timeout, $state, $ionicLoading, Merchant, Message, $ionicHistory) {
        $scope.messageBox = Message.getMessageBox($stateParams.id);
        $scope.deleteMessage = function (index) {
          Message.deleteMessage($stateParams.id, index);
        };
        $scope.goBack = function () {
          $ionicHistory.goBack();
        };
        // 退出页面后，标记消息已读
        $scope.$on("$ionicView.afterLeave", function (event, args) {
          Message.readOverMessage($stateParams.id);
        });
      }])
    .filter('fromNow', function () {
      return function (lastPhotoTime) {// lastPhotoTime 必须格式yyyy-MM-dd hh:mm:ss
        var beforeTime = Date.parse(lastPhotoTime);
        var nowTime = new Date().getTime(); //1970毫秒
        var timeDifference = Math.abs(nowTime - beforeTime) / 1000; //差取绝对值
        var time;
        if(timeDifference / 60 < 1){//刚刚
          time =  "刚刚";
        }else if ((timeDifference / 3600 < 1) && (timeDifference / 60 > 1)) { //几分钟前
          time = Math.floor(timeDifference / 60) + "分钟前";
        }else if ((timeDifference / 3600 > 1) && (timeDifference / 86400 < 1)) { //几小时前
          time = Math.floor(timeDifference / 3600) + "小时前";
        }else if ((timeDifference / 86400 > 1) && (timeDifference / 86400 <= 2)) { //昨天
          time =  "昨天";
        }else if ((timeDifference / 86400 > 2) && (timeDifference / 86400 <= 3)) { //前天
          //time = Math.floor(timeDifference / 86400) + "天前";
          time =  "前天";
        }else if ((timeDifference / 86400 > 3) && (timeDifference / 86400 <= 30)) { //几天前
          time = Math.floor(timeDifference / 86400) + "天前";
        }else if (timeDifference / 86400 > 30) { //yyyy年M月dd日
          var year = lastPhotoTime.substring(0, 4);
          var mouth = lastPhotoTime.substring(5, 7);
          if (mouth < 10)mouth = mouth.replace('0', '');
          var day = lastPhotoTime.substring(8, 10);
          time = year + '/' + mouth + '/' + day ;
        }
        return time;
      }
    })
}());

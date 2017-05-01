/**
 * Created by Administrator on 2015/10/11.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('SaveMoneyCtrl', ['$rootScope', '$scope', '$state', '$ionicLoading', '$ionicModal', 'Auth', 'Card', 'Toast', 'URL_CFG', 'user',
      function ($rootScope, $scope, $state, $ionicLoading, $ionicModal, Auth, Card, Toast, URL_CFG, user) {
        $scope.info = {};
        $scope.loggedIn = Auth.getMe().loggedIn;

        //获取完整的日期
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = (month < 10 ? "0" + month : month);
        day = (day < 10 ? "0" + day : day);
        var startDate = (year.toString() + "-" + month.toString() + "-01");
        var endDate = (year.toString() + "-" + month.toString() + "-" + day.toString());

        var topNum = 10;

        getRank(startDate, endDate, topNum);

        $scope.goHome = function () {
          user.goHome();
        }

        function getRank(startDate, endDate, topNum) {

          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
            showBackdrop: true
          });

          Card.getRank(startDate, endDate, topNum).then(function (data) {
            // 排名数据
            var myRank = {};
            // 名次
            myRank.Ranking = 0;
            // 如果已经登陆则显示排名
            if (Auth.getMe().loggedIn) {
              var AuthPhone = Auth.getMe().phone;

              for (var x in data) {
                // 本机号码排名数据
                if (AuthPhone == data[x].MobilePhone) {
                  myRank = data[x];
                  console.log(myRank);
                  if (myRank.MaxMerchantName == '') {
                    myRank.MaxMerchantName = '尚未消费';
                  }
                  $scope.myRank = myRank.ranking;
                  $scope.mySumPoint = myRank.SumPoint;
                  $scope.myMaxMerchantName = myRank.MaxMerchantName;
                  $scope.myMaxSumPoint = myRank.MaxSumPoint;
                }

                // 名称过滤
                if (data[x].UserName == '') {
                  data[x].UserName = '-';
                }

                //我的排行10名之后不显示
                if (myRank.ranking > 10) {
                  $scope.items = data.splice(x, 1);
                }
              }
              //myRank = data[topNum];
            }

            // 页面排名数据
            $scope.items = data.splice(3);

            //取前三
            $scope.firstItem = data[0];
            $scope.secondItem = data[1];
            $scope.thirdItem = data[2];
          })
            .finally(function () {
              $ionicLoading.hide();
            });
        }

      }
    ])
})();

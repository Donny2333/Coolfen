// 个人账单服务
/**
 * Created by wangxidong on 2015/10/10.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('billCtrl', ["$scope", "$timeout", "$ionicScrollDelegate", "$ionicPopover", "$ionicModal", "$ionicBackdrop", "$ionicLoading", "bill", '$rootScope', 'user', '$filter',
      function ($scope, $timeout, $ionicScrollDelegate, $ionicPopover, $ionicModal, $ionicBackdrop, $ionicLoading, bill, $rootScope, user, $filter) {
        //$scope.isError = false;
        //$scope.error = '';
        $scope.query = {
          pageIndex: 0,
          pageSize: 10,
          Status: 0,
          searching: false,
          noMoreItemsAvailable: true
        };
        $scope.bills = {
          data: [],
          amount: 0
        };
        $scope.modeStatus = 0;
        $scope.disabled = false;
        $scope.active = true;
        $scope.cx = false;
        $scope.bt=false;


        $scope.does = function () {
          $scope.cx = false;
          $scope.bt=false;
          $scope.active = true;
          $scope.modeStatus = 0;
          onLoad($scope.modeStatus);
          $scope.bills.data =[];
          $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

        }

        $scope.undo = function () {
          $scope.cx = true;
          $scope.bt=true;
          $scope.active = false;
          $scope.modeStatus = -1;
          onLoad($scope.modeStatus);
          $scope.bills.data =[];
          $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

        }

        $scope.goHome = function () {
          user.goHome();
        }

        //$rootScope.$on('Auth', function (event, args) {
        //  onLoad();
        //  console.log("111");
        //});

        //$scope.$on('$ionicView.beforeEnter', function () {
        //
        //});
        onLoad(0);
        /*
         * 加载交易完成账单
         * */

        function onLoad(mode) {
          $scope.query.pageIndex = 0;
          $scope.query.noMoreItemsAvailable = true;
          $scope.query.searching = true;

          //$ionicScollDelegate.scrollTop(true);

          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
            showBackdrop: true
          });

          var json = {
            PageIndex: $scope.query.pageIndex,
            PageSize: $scope.query.pageSize,
            Status: mode
          };

          bill.getFlow(json, function (request) {

              if (request.Outputs.length > 0 && request.ErrorCode == 0) {
                $scope.bills.data = request.Outputs;
                $scope.bills.amount = request.OutputsCount;
                $scope.query.noMoreItemsAvailable = false;
                //筛选出撤销订单
                //for(var i =0; i< request.Outputs.length ;i ++){
                //  if(request.Outputs[i].status == -1){
                //    var cancel = request.Outputs[i];
                //    console.log(cancel)
                //  }
                //}
              } else {
                //$scope.isError = true;
                //$scope.error = request.ErrorMessages;
                $scope.query.noMoreItemsAvailable = true;
                //$timeout(function () {
                //  $scope.isError = false;
                //}, 2000);
              }
            }, function (err) {
              //$scope.isError = true;
              //$scope.error = '与服务器连接失败：' + angular.toJson(err);
              $scope.query.noMoreItemsAvailable = true;

              //$timeout(function () {
              //  $scope.isError = false;
              //}, 2000);
            })
            .finally(function () {
              $ionicLoading.hide();
              $scope.query.searching = false;
            })
        }


        $scope.doRefresh = function () {
          $scope.disabled = true;
          $scope.query.pageIndex = 0;
          $scope.query.noMoreItemsAvailable = true;
          $scope.query.searching = true;

          var json = {
            PageIndex: $scope.query.pageIndex,
            PageSize: $scope.query.pageSize,
            Status: $scope.modeStatus
          };

          bill.getFlow(json, function (request) {
              if (request.Outputs.length > 0 && request.ErrorCode == 0) {
                $scope.bills.data = request.Outputs;
                $scope.bills.amount = request.OutputsCount;
                $scope.query.noMoreItemsAvailable = false;
              } else {
                //$scope.isError = true;
                //$scope.error = request.ErrorMessages;
                $scope.query.noMoreItemsAvailable = true;

                //$timeout(function () {
                //  $scope.isError = false;
                //}, 2000);
              }
            }, function (err) {
              $scope.disabled = false;
              $ionicLoading.hide();
              $scope.query.noMoreItemsAvailable = true;

              //$scope.isError = true;
              //$scope.error = '与服务器连接失败：' + angular.toJson(err);
              //
              //$timeout(function () {
              //  $scope.isError = false;
              //}, 2000);
            })
            .finally(function () {
              $scope.disabled = false;
              $scope.$broadcast("scroll.refreshComplete");
              $scope.query.searching = false;
            })
        }

        $scope.loadMore = function () {
          $scope.disabled = true;
          var json = {
            PageIndex: ++$scope.query.pageIndex,
            PageSize: $scope.query.pageSize,
            Status: $scope.modeStatus
          };

          $scope.query.searching = true;

          bill.getFlow(json, function (request) {
              if (request.Outputs.length > 0 && request.ErrorCode == 0) {
                var list = $scope.bills.data.concat(request.Outputs);
                $scope.bills.data = list;
                $scope.query.noMoreItemsAvailable = false;
              } else {
                $scope.query.noMoreItemsAvailable = true;
                //$scope.isError = true;
                //$scope.error = request.ErrorMessages;

                //$timeout(function () {
                //  $scope.isError = false;
                //}, 2000);
              }
            }, function (err) {
              //$scope.isError = true;
              //$scope.error = '与服务器连接失败：' + angular.toJson(err);
              $scope.disabled = false;
              $scope.query.noMoreItemsAvailable = true;

              //$timeout(function () {
              //  $scope.isError = false;
              //}, 2000);
            })
            .finally(function () {
              $scope.disabled = false;
              $scope.$broadcast("scroll.infiniteScrollComplete");
              $scope.query.searching = false;
              Toast.show('加载完成')
            });
        }

      }
    ])
})();

/**
 * Created by Donny on 2015/8/20.
 */
(function () {
  "use strict";
  angular.module('CoolfenMobileApp.directives')
    .directive('consumptionMoneyInput', ["$interval", "Toast", "Card", "$ionicLoading", "$rootScope", function ($interval, Toast, Card, $ionicLoading, $rootScope) {
      return {
        restrict: "E",
        replace: true,
        scope: {
          info: "=info",
          card: "=card",
          max: "=max",
          btnDisabled: "=btnDisabled"
        },
        template: "<input type='number' ng-model='info.ConsumptionMoney' ng-model-options='{debounce: 500}'>",
        link: function (scope, element, attrs) {
          var oldConsumptionMoney;

          // 连接后台获取数据
          function onGetPoint() {
            $rootScope.$broadcast('user:update', {refreshCardBag: true});

            var json = {
              ExpenseMoney: scope.info.ConsumptionMoney,
              ExclusiveMoney: scope.info.ExclusiveMoney ? scope.info.ExclusiveMoney : 0,
              UserCardID: scope.info.UserCardID,
              UsePoint: '0'
            };

            Card.getMaxUsePointByExpense(json, function (data) {
              if (data && data.ErrorCode == 0) {
                scope.info.UsePoint = data.Outputs[0].UsePoint;
                scope.info.ActualConsumptionMoney = data.Outputs[0].ActualConsumptionMoney;
                scope.info.GetPoint = data.Outputs[0].GetPoint;
                scope.info.EquateMoney = data.Outputs[0].EquateMoney;
                scope.info.BalancePoint = data.Outputs[0].BalancePoint;

                scope.btnDisabled = false;
                scope.max = data.Outputs[0].UsePoint;
              } else {
                scope.error = data.ErrorMessages[0];
                scope.btnDisabled = true;
              }
            }, function (err) {
              Toast.show('与服务器连接失败：' + angular.toJson(err));
              scope.btnDisabled = true;
            });
          }

          //更新DOM内容
          function update() {

            if (scope.info.ConsumptionMoney != oldConsumptionMoney) {
              oldConsumptionMoney = scope.info.ConsumptionMoney;

              if (scope.info.ConsumptionMoney === undefined || scope.info.ConsumptionMoney === null || scope.info.ConsumptionMoney <= 0) {
                scope.btnDisabled = true;
                scope.info.UsePoint = null;
                scope.info.ActualConsumptionMoney = null;
                scope.info.GetPoint = null;
                scope.info.BalancePoint = scope.card.Points;
                if (scope.info.ConsumptionMoney < 0) {
                  Toast.show('消费金额必须是大于零的数字！');
                }
              } else {
                onGetPoint();
              }
            }
          }

          //监听DOM元素
          scope.$watch('info.ConsumptionMoney', function (value) {
            update();
          });
        }
      }
    }])

    .directive('exclusiveMoneyInput', ["$interval", "Toast", "Card", "$ionicLoading", "$rootScope", function ($interval, Toast, Card, $ionicLoading, $rootScope) {
      return {
        restrict: "E",
        replace: true,
        scope: {
          info: "=info",
          card: "=card",
          max: "=max",
          btnDisabled: "=btnDisabled"
        },
        template: "<input type='number' ng-model='info.ExclusiveMoney' ng-model-options='{debounce: 500}'>",
        link: function (scope, element, attrs) {
          var oldExclusiveMoney;

          // 连接后台获取数据
          function onGetPoint() {
            if (!scope.info.ConsumptionMoney) {
              return;
            }

            var json = {
              ExpenseMoney: scope.info.ConsumptionMoney,
              ExclusiveMoney: scope.info.ExclusiveMoney ? scope.info.ExclusiveMoney : 0,
              UserCardID: scope.info.UserCardID,
              UsePoint: '0'
            };

            Card.getMaxUsePointByExpense(json, function (data) {
              if (data && data.ErrorCode == 0) {
                scope.info.UsePoint = data.Outputs[0].UsePoint;
                scope.info.ActualConsumptionMoney = data.Outputs[0].ActualConsumptionMoney;
                scope.info.GetPoint = data.Outputs[0].GetPoint;
                scope.info.EquateMoney = data.Outputs[0].EquateMoney;
                scope.info.BalancePoint = data.Outputs[0].BalancePoint;

                scope.btnDisabled = false;
                scope.max = data.Outputs[0].UsePoint;
              } else {
                scope.error = data.ErrorMessages[0];
                scope.btnDisabled = true;
              }
            }, function (err) {
              Toast.show('与服务器连接失败：' + angular.toJson(err));
              scope.btnDisabled = true;
            });
          }

          //更新DOM内容
          function update() {

            if (scope.info.ExclusiveMoney != oldExclusiveMoney) {
              oldExclusiveMoney = scope.info.ExclusiveMoney;

              if (scope.info.ExclusiveMoney < 0) {
                scope.btnDisabled = true;
                scope.info.UsePoint = null;
                scope.info.ActualConsumptionMoney = null;
                scope.info.GetPoint = null;
                scope.info.BalancePoint = scope.card.Points;
                Toast.show('消费金额必须是大于零的数字！');
              } else {
                onGetPoint();
              }
            }
          }

          //监听DOM元素
          scope.$watch('info.ExclusiveMoney', function (value) {
            update();
          });
        }
      }
    }])

    .directive('pointInput', ["$interval", "Toast", "Card", "$rootScope", function ($interval, Toast, Card, $rootScope) {
      return {
        restrict: "E",
        replace: true,
        scope: {
          info: "=info",
          card: "=card",
          max: "=max",
          btnDisabled: "=btnDisabled"
        },
        template: "<input type='number' ng-model='info.UsePoint' ng-model-options='{debounce: 500}'>",
        link: function (scope, element, attrs) {
          var oldUsePoint;

          // 连接后台获取数据
          function onCheck() {
            $rootScope.$broadcast('user:update', {refreshCardBag: true});
            var json = {
              ExpenseMoney: scope.info.ConsumptionMoney,
              ExclusiveMoney: scope.info.ExclusiveMoney ? scope.info.ExclusiveMoney : 0,
              UserCardID: scope.info.UserCardID,
              UsePoint: scope.info.UsePoint
            };

            Card.getUsePointByExpense(json, function (data) {
              if (data && data.ErrorCode == 0) {
                scope.info.ActualConsumptionMoney = data.Outputs[0].ActualConsumptionMoney;
                scope.info.GetPoint = data.Outputs[0].GetPoint;
                scope.info.BalancePoint = data.Outputs[0].BalancePoint;
                scope.info.EquateMoney = data.Outputs[0].EquateMoney;

                scope.btnDisabled = false;
              } else {
                scope.error = data.ErrorMessages[0];
                scope.btnDisabled = true;
              }
            }, function (err) {
              Toast.show('与服务器连接失败：' + angular.toJson(err));
              scope.btnDisabled = true;
            })
          }

          //更新DOM内容
          function update() {
            if (!scope.card) {
              return;
            } else if (scope.info.UsePoint == undefined || scope.info.UsePoint == null || scope.info.UsePoint < 0) {
              scope.btnDisabled = true;
              scope.info.ActualConsumptionMoney = null;
              scope.info.GetPoint = null;
              scope.info.BalancePoint = scope.card.Points;
              oldUsePoint = scope.info.UsePoint;
              if (scope.info.UsePoint < 0) {
                Toast.show('积分抵现必须是正整数！');
              }
            } else if (scope.info.UsePoint > scope.max) {
              scope.btnDisabled = true;
              scope.info.ActualConsumptionMoney = null;
              scope.info.GetPoint = null;
              scope.info.BalancePoint = scope.card.Points;
              oldUsePoint = scope.info.UsePoint;
              Toast.show('积分抵现不能超过' + scope.max);

            } else if (scope.info.UsePoint != oldUsePoint) {
              oldUsePoint = scope.info.UsePoint;
              onCheck();
            }
          }

          //监听DOM元素
          scope.$watch("info.UsePoint", function (value) {
            update();
          });
        }
      }
    }])

})();

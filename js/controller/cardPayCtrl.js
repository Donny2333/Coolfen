/**
 * Created by SF002 on 2015/9/24.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('cardPayCtrl', ['$scope', '$rootScope', '$state', '$ionicLoading', '$timeout', '$ionicHistory', 'Toast', 'Card', 'user', 'Auth', 'ModalService', 'Geolocation',
      function ($scope, $rootScope, $state, $ionicLoading, $timeout, $ionicHistory, Toast, Card, user, Auth, ModalService, Geolocation) {
        var vm = $scope.vm = {};
        Card.getCurUserCard().then(function (userCard) {
          vm.userCard = userCard;
          vm.title = vm.userCard.PublicCardOutputSimplify.PName.CN;
          vm.promise = null;
          vm.disabled = true;
          vm.max = -1;
          vm.UserCardID = vm.userCard.UserCardID;
          vm.BalancePoint = vm.userCard.Points;
          vm.EquateMoney = 0;
          vm.Status = 0;
          vm.merchant = null;
          vm.merchants = [];
          vm.isAlipay = true;
          vm.isPrepaidCardMerchant = vm.userCard.PublicCardOutputSimplify.IsPrepaidCard;
          // 获取商家
          Card.getUserCardInfo(vm.UserCardID).then(function (data) {
            _.forEach(data.PublicCardOutputSimplify.RetailerAddressList, function (item) {
              vm.merchants.push({
                id: item.ChildMerchantID,
                name: item.ChildMerchantName
              })
            });

            if (data.PublicCardOutputSimplify.RetailerAddressList && data.PublicCardOutputSimplify.RetailerAddressList.length > 0) {
              vm.merchant = vm.merchants[0];
            }
          });
        }, function (err) {
          Toast.show(err);
        });


        $scope.me = Auth.getMe();

        $scope.$on("$ionicView.afterEnter", function (event, args) {
          $rootScope.$broadcast('user:update', {refreshCardBag: true});
        });

        $scope.onGetPoint = function () {
          var re = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;

          if (vm.promise) {
            $timeout.cancel(vm.promise);
            vm.promise = null;
          }

          if (_.isUndefined(vm.ConsumptionMoney)) {
            vm.disabled = true;
            vm.UsePoint = null;
            vm.ActualConsumptionMoney = null;
            vm.GetPoint = null;
            vm.BalancePoint = vm.userCard.Points;
            return;
          }

          if (!re.test(vm.ConsumptionMoney)) {
            vm.disabled = true;
            vm.max = -1;
            vm.UsePoint = null;
            vm.ActualConsumptionMoney = null;
            vm.GetPoint = null;
            vm.BalancePoint = vm.userCard.Points;
            //Toast.show('消费金额必须是大于零的数字！');
            return;
          }

          var json = {
            ExpenseMoney: vm.ConsumptionMoney,
            UserCardID: vm.UserCardID,
            UsePoint: '0'
          };

          $scope.promise = $timeout(function () {
            Card.getMaxUsePointByExpense(json, function (data) {
              if (data && data.ErrorCode == 0) {
                vm.UsePoint = data.Outputs[0].UsePoint;
                vm.ActualConsumptionMoney = data.Outputs[0].ActualConsumptionMoney;
                vm.GetPoint = data.Outputs[0].GetPoint;
                vm.EquateMoney = data.Outputs[0].EquateMoney;
                vm.BalancePoint = data.Outputs[0].BalancePoint;

                vm.disabled = false;
                vm.max = data.Outputs[0].UsePoint;
              } else {
                vm.disabled = true;
                console.log(data.ErrorMessages[0]);
                Toast.show(data.ErrorMessages[0]);
              }
            }, function (err) {
              vm.disabled = true;
              console.log('与服务器连接失败：' + angular.toJson(err));
              Toast.show('与服务器连接失败：' + angular.toJson(err));
            })
              .finally(function () {
                vm.promise = null;

                if (_.isUndefined(vm.ConsumptionMoney)) {
                  vm.disabled = true;
                  vm.UsePoint = null;
                  vm.ActualConsumptionMoney = null;
                  vm.GetPoint = null;
                  vm.BalancePoint = vm.userCard.Points;
                }
              })
          }, 500);
        };

        $scope.goHome = function () {
          user.goHome(true);
        };

        $rootScope.$on('Auth:login', function (e) {
          $scope.me = Auth.getMe();

          if (Auth.getMe().loggedIn && !Auth.getMe().isNew) {
            user.goHome(true);
          }
        });

        //$scope.$on("$ionicView.beforeEnter",function(){
        //  $rootScope.$broadcast('user:update', {refreshCardBag: true});
        //});

        $scope.$on('$ionicView.beforeLeave', function () {
          $rootScope.$broadcast('user:update', {refreshCardBag: true});
        });

        $scope.onPay = function () {
          if (!Auth.getMe().loggedIn) {
            //Card.setCurCardId(vm.userCard.PublicCardID);
            Card.setCurUserCard(vm.userCard);
            $scope.$parent.login();
          } else if (!Auth.getMe().isMobilePhoneNumberVerified) {
            $scope.$parent.info.mobilePhone = Auth.getMe().phone;
            $scope.$parent.info.telNumberDisabled = true;
            $scope.$parent.login();
          } else {
            var actualConsumptionMoney = parseFloat(vm.ActualConsumptionMoney).toFixed(2);
            var payMode = actualConsumptionMoney == 0 ? 0 : vm.isAlipay ? 1 : 2;
            var json = {
              UserCardID: vm.UserCardID,
              BalancePoint: parseFloat(vm.BalancePoint).toFixed(2),
              ConsumptionMoney: parseFloat(vm.ConsumptionMoney).toFixed(2),
              UsePoint: parseFloat(vm.UsePoint).toFixed(2),
              EquateMoney: 0,
              ActualConsumptionMoney: parseFloat(vm.ActualConsumptionMoney).toFixed(2),
              GetPoint: parseInt(vm.GetPoint),
              MerchantID: vm.merchant.id,
              PayMode: payMode,
              Status: 0
            };
            $timeout(function () {
              vm.disabled = true;
            }, 0);


            // 计算抵现金额
            json.EquateMoney = parseFloat(json.ConsumptionMoney - json.ActualConsumptionMoney).toFixed(2);

            $ionicLoading.show({
              template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中...',
              showBackdrop: true
            });

            //payMode == 0 现金交易不走支付插件
            if (payMode == 0) {
              Card.createNewPointsTransaction(json).then(function (data) {
                console.log(data);
                //订单编号
                $scope.transaction = data;
                vm.isUpdate = true;
                Toast.show("交易成功!");
                ModalService
                  .init('Pass.html', $scope)
                  .then(function (modal) {
                    modal.show();
                  });
                vm.ConsumptionMoney = 0;
                vm.ActualConsumptionMoney = 0;
                vm.userCard.Points = vm.BalancePoint;
                Card.setCurUserCard(vm.userCard);
                $rootScope.$broadcast('Card.Pay', {card: vm.userCard, vm: vm});
                Auth.setPoint(Number(Auth.getMe().BalancePoints) + vm.GetPoint - vm.UsePoint);
              }, function (error) {
                Toast.show(error);
                $scope.payError = error;
                ModalService
                  .init('pay_fail.html', $scope)
                  .then(function (modal) {
                    modal.show();
                  });
              })
                .finally(function () {
                  $ionicLoading.hide();

                });
            }
            else {
              // 创建订单并获取订单号
              Card.createNewTransaction(json).then(function (data) {
                if (vm.isAlipay) {
                  aliPay(data);
                } else {
                  weixinPay(data);
                }
              }, function (error) {
                Toast.show(error);
              }).finally(function () {
                $ionicLoading.hide();
                //vm.isUpdate = true;
                $timeout(function () {
                  vm.disabled = false;
                }, 0);
              });
            }
          }


          //window.alipay.pay({
          //    tradeNo: Math.random().toString(36).substring(3),
          //    subject: "测试标题",
          //    body: "我是测试内容",
          //    price: 0.01,
          //    fromUrlScheme: "demoScheme://afterPaymentSuccess",
          //    notifyUrl: "http://dev.breadth.com.cn/zhifu/alipay/notify_url.php"
          //}, function () {
          //    alert('succeed');
          //}, function () {
          //    alert('fail');
          //});

          //cordova.plugins.WXPay.wxpay(
          //    {   "body":"testwx",
          //        "feeType":"1",
          //        "notifyUrl":"",
          //        "totalFee":"0.01",
          //        "traceId":Math.random().toString(36).substring(3),
          //        "tradeNo":Math.random().toString(36).substring(3)
          //    },
          //    function(success){
          //        console.log('success:' + success);
          //        alert("支付完成");
          //
          //    },function(error){
          //        console.log("error:" + error);
          //        alert("支付失败");
          //    }
          //);
        };


        // 支付宝支付
        function aliPay(data) {
          var out_trade_no = data[0];// 15位订单号
          var subject = vm.title;
          var bodtxt = vm.title;
          var total_fee = parseFloat(vm.ActualConsumptionMoney).toFixed(2);
          var url = data[1];

          window.alipay.pay({
            tradeNo: out_trade_no,
            subject: subject,
            body: bodtxt,
            price: total_fee,
            fromUrlScheme: "demoScheme://afterPaymentSuccess",
            notifyUrl: url
          }, function (success) {
            console.log(success);
            var json = {
              TransactionNum: out_trade_no,
              TransactionResult: 1
            };
            // 保存订单信息
            Card.setMobileUserPayResult(json).then(function (data) {
              //支付结果显示
              $scope.transaction = data;

              // 成功支付，则跳转回详情页面
              vm.userCard.Points = vm.BalancePoint;
              Card.setCurUserCard(vm.userCard);
              $rootScope.$broadcast('Card.Pay', {card: vm.userCard, vm: vm});
              Auth.setPoint(Number(Auth.getMe().BalancePoints) + vm.GetPoint - vm.UsePoint);
              //$rootScope.$broadcast('user:update', {refreshCardBag: true});
              Toast.show('支付成功');
              ModalService
                .init('Pass.html', $scope)
                .then(function (modal) {
                  modal.show();
                });
              $ionicLoading.hide();
            });
          }, function (error) {
            Toast.show(error);
            $ionicLoading.hide();
            $scope.payError = error;
            ModalService
              .init('pay_fail.html', $scope)
              .then(function (modal) {
                modal.show();
              });
          });
        }

        // 微信支付
        function weixinPay(data) {
          var out_trade_no = data[0];        // 15位订单号
          var url = data[1];                // 异步同步接口
          var bodtxt = vm.title;
          var total_fee = parseFloat(vm.ActualConsumptionMoney).toFixed(2) * 100;

          //cordova.plugins.WXPay.wxpay(
          //  {
          //    "body": bodtxt,
          //    "feeType": "1",
          //    "notifyUrl": url,
          //    "totalFee": total_fee,
          //    "traceId": out_trade_no,
          //    "tradeNo": out_trade_no
          //  },
          //  function (success) {
          //    var json = {
          //      TransactionNum: out_trade_no,
          //      TransactionResult: 1
          //    };
          //    // 保存订单信息
          //    Card.setMobileUserPayResult(json).then(function (data) {
          //      // 成功支付，则跳转回详情页面
          //      $scope.transaction = data;
          //      vm.userCard.Points = vm.BalancePoint;
          //      Card.setCurUserCard(vm.userCard);
          //      $rootScope.$broadcast('Card.Pay', {card: vm.userCard, vm: vm});
          //      Auth.setPoint(Number(Auth.getMe().BalancePoints) + vm.GetPoint - vm.UsePoint);
          //      //$rootScope.$broadcast('user:update', {refreshCardBag: true});
          //      Toast.show('支付成功');
          //      ModalService
          //        .init('Pass.html', $scope)
          //        .then(function (modal) {
          //          modal.show();
          //        });
          //      $ionicLoading.hide();
          //    });
          //  }, function (error) {
          //    Toast.show('支付失败');
          //    $ionicLoading.hide();
          //  }
          //);
          window.Wechat.sendPaymentRequest(
            {
              "body": bodtxt,
              "feeType": "1",
              "notifyUrl": url,
              "totalFee": total_fee,
              "traceId": out_trade_no,
              "tradeNo": out_trade_no
            },
            function (success) {
              var json = {
                TransactionNum: out_trade_no,
                TransactionResult: 1
              };
              // 保存订单信息
              Card.setMobileUserPayResult(json).then(function (data) {
                // 成功支付，则跳转回详情页面
                $scope.transaction = data;
                vm.userCard.Points = vm.BalancePoint;
                Card.setCurUserCard(vm.userCard);
                $rootScope.$broadcast('Card.Pay', {card: vm.userCard, vm: vm});
                Auth.setPoint(Number(Auth.getMe().BalancePoints) + vm.GetPoint - vm.UsePoint);
                Toast.show('支付成功');
                ModalService
                  .init('Pass.html', $scope)
                  .then(function (modal) {
                    modal.show();
                  });
                $ionicLoading.hide();
              });
            }, function (error) {
              Toast.show(error);
              $ionicLoading.hide();
              $scope.payError = error;
              ModalService
                .init('pay_fail.html', $scope)
                .then(function (modal) {
                  modal.show();
                });
            })
        }
        $scope.open = function() {
          ModalService
            .init('payFail.html', $scope)
            .then(function (modal) {
              modal.show();
            });
        }
      }]);

})();

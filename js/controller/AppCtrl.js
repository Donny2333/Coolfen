/**
 * Created by Donny on 2015/9/23.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', '$interval', '$state', '$rootScope', '$ionicLoading', 'Auth', 'user', 'Toast', '$cordovaInAppBrowser', '$localStorage', 'Message', '$ionicSideMenuDelegate',
      function ($scope, $ionicModal, $timeout, $interval, $state, $rootScope, $ionicLoading, Auth, user, Toast, $cordovaInAppBrowser, $localStorage, Message, $ionicSideMenuDelegate) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:

        // Form data for the login modal
        $scope.loggedIn = false;
        $rootScope.newMessage = false; // “消息小红点”显示标记
        $scope.info = {
          text: '获取验证码',
          time: 60,
          disabled: false,
          authCode: '',
          mobilePhone: '',
          telNumberDisabled: false
        }
        $scope.member = {};

        $scope.imageURI = $localStorage.imageURI;
        $scope.imgSrc = $localStorage.imgSrc;

        // 接受登录通知
        $rootScope.$on('Auth:login', function (event, args) {
          $scope.info.telNumberDisabled = false;
          $scope.loggedIn = Auth.getMe().loggedIn;
          angular.copy(Auth.getMe(), $scope.member);
          Message.HasNewMessages();

          if ($scope.member.Gender == 0) {
            $scope.sexSrc = 'img/my/man.png'
          } else {
            $scope.sexSrc = 'img/my/woman.png'
          }
          console.log("event : Auth:login--" + $scope.loggedIn);
          //console.log($scope.member);
        });

        $rootScope.$on('user:update', function (event, args) {
          angular.copy(Auth.getMe(), $scope.member);
          if ($scope.member.Gender == 0) {
            $scope.sexSrc = 'img/my/man.png'
          } else {
            $scope.sexSrc = 'img/my/woman.png'
          }
          //console.log("event : user:update");
        });

        $rootScope.$on('user:photo', function (event, args) {
          $scope.imageURI = $localStorage.imageURI;
          $scope.imgSrc = $localStorage.imgSrc;

        });

        // 每次打开侧菜单均向后台询问“消息小红点”显示状态
        $scope.$watch(function () {
          return $ionicSideMenuDelegate.isOpenLeft();
        }, function (value) {
          if (value) {
            Message.HasNewMessages();
          }
        });

        $scope.$watch(
          function () {
            if ($ionicSideMenuDelegate.isOpen()) {
              $('.yy').show();
            } else {
              $('.yy').hide();
            }
          });

        $scope.search = function () {
          $state.go('app.search');
        };

        $scope.checkMessage = function () {
          $rootScope.newMessage = false;
          if (Auth.getMe().loggedIn) {
            $state.go('app.messageList');
          } else {
            $scope.login();
          }
        }

        $scope.checkMyBill = function(){
          if (Auth.getMe().loggedIn) {
            $state.go('app.bill');
          } else {
            $scope.login();
          }
        }

        $scope.goUser = function () {
          if (Auth.getMe().loggedIn) {
            $state.go('app.user');
          } else {
            $scope.login();
          }
        };

        $scope.onGame = function () {
          var options = {
            location: 'no',
            clearcache: 'no',
            toolbar: 'yes',
            closebuttoncaption: '退出'
          };

          $cordovaInAppBrowser.open("http://activity.coolfen.com:8000/Game/index.html?mobileNo=" + Auth.getMe().ID, '_blank', options)
        }

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
          scope: $scope,
          animation: 'slide-in-up',
          focusFirstInput: true
        }).then(function (modal) {
          $scope.loginModal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
          $scope.loginModal.hide();
        };

        // Open the login modal
        $scope.login = function () {
          $scope.loginModal.show();
        };

        var stop;

        $scope.getAuthCode = function () {
          $scope.info.time = 60;
          $scope.info.disabled = true;

          stop = $interval(function () {
            if ($scope.info.time > 0) {
              $scope.info.text =  $scope.info.time + '秒后重发';
              $scope.info.time--;

            } else {
              $interval.cancel(stop);
              $scope.info.text = '获取验证码';
              $scope.info.disabled = false;
            }
          }, 1000);

          Auth.getAuthCode($scope.info.mobilePhone).then(function (data) {
            //模拟验证码逻辑-start
            Auth.getLastAuthCode($scope.info.mobilePhone).then(function (data) {
              $scope.authCode = data;
              $scope.info.authCode = data;
            }, function (error) {
              $scope.authCode = null;
            });
            //模拟验证码逻辑-end
          }, function (error) {
            $scope.authCode = null;
          })
        };

        $scope.onLogin = function () {
          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 登录中... ',
            showBackdrop: true
          });

          Auth.login($scope.info.mobilePhone, $scope.info.authCode)
            .then(function () {
              $ionicLoading.hide();
              Auth.verifyLogin();
              $scope.info.authCode = '';
              $scope.closeLogin();
            }, function (err) {
              $ionicLoading.hide();
              Toast.show(err);
            });
        };

        //console.log($scope.loggedIn);
        //服务协议
        $ionicModal.fromTemplateUrl('templates/my/contract.html', {
          scope: $scope,
          animation: false,
          focusFirstInput: true
        }).then(function (modal) {
          $scope.contractModal = modal;

        });

        // Triggered in the login modal to close it
        $scope.closeContract = function () {
          $scope.contractModal.hide();
        };

        // Open the login modal
        $scope.openContract = function () {
          $scope.contractModal.show();
        };

        $scope.loginClear = function(){
          $scope.info.mobilePhone = '';
        }

        $('.i_act1').bind('touchstart', function () {
          $('.c_act1').css('background', 'transparent')
        })
        $('.i_act1').bind('touchend', function () {
          $('.c_act1').css('background', 'rgba(255, 255, 255, 0.4)')
        })

        $('.i_act2').bind('touchstart', function () {
          $('.c_act2').css('background', 'transparent')
        })
        $('.i_act2').bind('touchend', function () {
          $('.c_act2').css('background', 'rgba(255, 255, 255, 0.4)')
        })

        $('.i_act3').bind('touchstart', function () {
          $('.c_act3').css('background', 'transparent')
        })
        $('.i_act3').bind('touchend', function () {
          $('.c_act3').css('background', 'rgba(255, 255, 255, 0.4)')
        })

      }])
})();

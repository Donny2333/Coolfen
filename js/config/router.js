/**
 * Created by Donny on 2015/9/23.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.router')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('intro', {
          url: '/intro',
          templateUrl: 'templates/app/intro.html',
          controller: 'IntroCtrl'
        })

        .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/home/menu.html',
          controller: 'AppCtrl',
          resolve: {
            verifyLogin: ['Auth', '$localStorage', '$ionicLoading', '$timeout', function (Auth, $localStorage, $ionicLoading, $timeout) {
              if (!$localStorage.passedIntro) {
                $ionicLoading.show({
                  template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
                  showBackdrop: false,
                  duration: 0
                });
              }

              Auth.CheckIsMobileLogin().finally(function () {
                $ionicLoading.hide();
                Auth.verifyLogin();
              });
            }],

            userPosition: ['Geolocation', function (Geolocation) {
              Geolocation.getGeoLocation();
            }]
          }
        })


        .state('app.home', {
          url: '/home',
          views: {
            'menuContent': {
              templateUrl: 'templates/home/index.html',
              controller: 'homeCtrl'
            }
          }
        })

        .state('app.search', {
          url: '/search',
          views: {
            'menuContent': {
              templateUrl: 'templates/home/search.html',
              controller: 'searchCtrl'
            }
          }
        })

        .state('app.cardPay', {
          url: '/cardPay',
          views: {
            'menuContent': {
              templateUrl: 'templates/home/cardPay.html',
              controller: 'cardPayCtrl'
            }
          }
        })

        .state('app.bill', {
          url: '/bill',
          views: {
            'menuContent': {
              templateUrl: 'templates/my/bill.html',
              controller: 'billCtrl'
            }
          }
        })

        .state('app.messageList', {
          url: '/messageList',
          views: {
            'menuContent': {
              templateUrl: 'templates/my/messageList.html',
              controller: 'messageListCtrl'
            }
          }
        })

        .state('app.messageDetail', {
          url: '/messageDetail/:id',
          views: {
            'menuContent': {
              templateUrl: 'templates/my/messageDetail.html',
              controller: 'messageDetailCtrl'
            }
          }
        })

        .state('app.user', {
          url: '/user',
          views: {
            'menuContent': {
              templateUrl: 'templates/my/user.html',
              controller: 'userCtrl'
            }
          }
        })

        .state('app.activity', {
          url: '/activity',
          views: {
            'menuContent': {
              templateUrl: 'templates/coolfen/activity.html',
              controller: 'activityCtrl'
            }
          }
        })

        .state('app.coolFriend', {
          url: '/coolFriend',
          views: {
            'menuContent': {
              templateUrl: 'templates/coolfen/coolFriend.html',
              controller: 'CoolFriendCtrl'
            }
          }
        })

        .state('app.hotspot', {
          url: '/hotspot',
          views: {
            'menuContent': {
              templateUrl: 'templates/coolfen/hotspot.html',
              controller: 'hotspotCtrl'
            }
          }
        })

        .state('app.saveMoney', {
          url: '/saveMoney',
          views: {
            'menuContent': {
              templateUrl: 'templates/coolfen/saveMoney.html',
              controller: 'SaveMoneyCtrl'
            }
          }
        })

        .state('app.about', {
          url: '/about',
          views: {
            'menuContent': {
              templateUrl: 'templates/app/about.html',
              controller: 'AboutCtrl'
            }
          }
        })

        .state('app.setting', {
          url: '/setting',
          views: {
            'menuContent': {
              templateUrl: 'templates/app/setting.html',
              controller: 'SettingCtrl'
            }
          }
        })
        .state('app.feedBack', {
          url: '/feedBack',
          views: {
            'menuContent': {
              templateUrl: 'templates/app/feedBack.html',
              controller: 'FeedbackCtrl'
            }
          }
        })
        .state('app.card-position', {
          url: '/cards/:id/position',
          views: {
            'menuContent': {
              templateUrl: 'templates/home/card-position.html',
              controller: 'CardPositionCtrl'
            }
          }
        });

      // if none of the above states are matched, use this as the fallback
      //$urlRouterProvider.otherwise('/intro');
    }]);

})();

/**
 * Created by SF002 on 2015/11/18.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('SettingCtrl', function ($scope, $rootScope, Auth, user, $ionicPopup, $ionicLoading, Card, $ionicActionSheet, CoolfenShare, Toast, $ionicHistory, $state, $ionicSideMenuDelegate,STRING) {

      $rootScope.$on('Auth:login', function (event, args) {
        $scope.loggedIn = Auth.getMe().loggedIn;
      });
      $scope.version=STRING.APP_VERSION.RELEASE;

      var shareContent;
      CoolfenShare.getShareContent().then(function (data) {
        shareContent = data;
      });

      var successFn = function () {
        $scope.$apply(function () {
          console.log('分享成功');
          Toast.show('分享成功');
        })
      };

      var failFn = function () {
        $scope.$apply(function () {
          console.log('分享失败');
          Toast.show('分享失败');
        })
      };

      //分享弹窗
      $scope.showShare = function () {

        // Show the action sheet
        $ionicActionSheet.show({
          buttons: [
            {text: '<img src="img/share/wechat.png" width="40" height="40"> <span class="text-action">微信好友</span>'},
            {text: '<img src="img/share/circleFriends.png" width="40" height="40"> <span class="text-action">朋友圈</span>'},
            {text: '<img src="img/share/sinaWebo.png" width="40" height="40"> <span class="text-action">新浪微博</span>'},
            {text: '<img src="img/share/qFriends.png" width="40" height="40"> <span class="text-action">QQ好友</span>'},
            {text: '<img src="img/share/qzone.png" width="40" height="40"> <span class="text-action">QQ空间</span>'},
          ],
          cancelText: '取消',
          cancel: function () {
            // add cancel code..
          },
          buttonClicked: function ($index) {
            if ($index == 0) {
              console.log('微信好友');
              CoolfenShare.shareToWeiXin(window.Wechat.Scene.SESSION, shareContent, successFn, failFn);
            } else if ($index == 1) {
              console.log('朋友圈');
              CoolfenShare.shareToWeiXin(window.Wechat.Scene.TIMELINE, shareContent, successFn, failFn);
            } else if ($index == 2) {
              console.log('新浪微博');
              CoolfenShare.shareToWeibo(shareContent, successFn, failFn);
            } else if ($index == 3) {
              console.log('QQ好友');
              CoolfenShare.shareToQQ(shareContent, successFn, failFn);
            } else if ($index == 4) {
              console.log('QQ空间');
              CoolfenShare.shareToQZone(shareContent, successFn, failFn);
            }
          },
          cssClass: 'social-actionsheet'
        });

      };

      //登出
      $scope.userLogout = function () {

        var hideSheet = $ionicActionSheet.show({
          buttons: [
            {text: '确定'},
            {text: '取消'}
          ],

          titleText: '您确定要退出登录吗？',
          cancel: function () {
            // add cancel code..
          },
          buttonClicked: function (index) {
            if(index==0){
              $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner><br> 登出中... ',
                showBackdrop: true
              });

              Auth.logout().then(function (data) {
                $scope.$parent.info.telNumberDisabled = true;
                // 删除用户卡本地缓存
                Card.removeUserCardCache();
                Auth.setMe('', false);

                // 获取游客身份
                Auth.CheckIsMobileLogin().finally(function () {
                  console.log('Auth.CheckIsMobileLogin');
                  Auth.verifyLogin().finally(function () {
                    console.log('Auth.verifyLogin');
                    user.goHome();
                    $ionicLoading.hide();
                  });
                });
              }, function (error) {
                $ionicLoading.hide();
                Toast.show(error);
              })
            }else {
              hideSheet();
            }
          },
          cssClass: 'logout-actionsheet'
        });

        //var confirmPopup = $ionicPopup.confirm({
        //  cssClass: 'logout-body',
        //  template: '<div class=\"logout-title text-center \">确认退出此账户吗？</div>',
        //  okText: '确认',
        //  cancelText: '取消',
        //  cancelType: 'button-light',
        //  okType: 'button-coolfen'
        //});
        //confirmPopup.then(function (res) {
        //  if (res) {
        //    $ionicLoading.show({
        //      template: '<ion-spinner icon="ios"></ion-spinner><br> 登出中... ',
        //      showBackdrop: true
        //    });
        //
        //    Auth.logout().then(function (data) {
        //      $scope.$parent.info.telNumberDisabled = true;
        //      // 删除用户卡本地缓存
        //      Card.removeUserCardCache();
        //      Auth.setMe('', false);
        //
        //      // 获取游客身份
        //      Auth.CheckIsMobileLogin().finally(function () {
        //        console.log('Auth.CheckIsMobileLogin');
        //        Auth.verifyLogin().finally(function () {
        //          console.log('Auth.verifyLogin');
        //          user.goHome();
        //          $ionicLoading.hide();
        //        });
        //      });
        //    }, function (error) {
        //      $ionicLoading.hide();
        //      Toast.show(error);
        //    })
        //  }
        //})

      };

      $scope.goHome = function (noLeft) {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });

        $state.go('app.home');

        if (angular.isUndefined(noLeft) || !noLeft) {
          $ionicSideMenuDelegate.toggleLeft();
        }
      }
    })
}());

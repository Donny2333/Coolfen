/**
 * Created by wangxidong on 2015/10/12.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')
// 用户中心
    .factory('user', ['$http', '$localStorage', 'URL_CFG', '$state', '$ionicHistory', '$ionicSideMenuDelegate',
      function ($http, $sessionStorage, URL_CFG, $state, $ionicHistory, $ionicSideMenuDelegate) {
        var MobileUserInfoUrl = URL_CFG.api + 'Account/MobileUserInfo';
        var WrapperAccountUpdateInfoUrl = URL_CFG.api + 'Account/WrapperAccountUpdateInfo';
        return {
          // 查询手机用户
          MobileUserInfo: function (successFn, errorFn) {
            return $http.get(MobileUserInfoUrl)
              .success(successFn)
              .error(errorFn);
          },

          // 修改手机用户信息
          WrapperAccountUpdateInfo: function (user, successFn, errorFn) {
            var json = {
              AuthCode: null,
              Birthday: user.Birthday,
              Email: user.Email,
              ID: user.ID,
              MobilePhoneNumber: user.phone,
              Gender: user.Gender,
              Tenant: user.Tenant,
              Username: user.Username
            };

            return $http.post(WrapperAccountUpdateInfoUrl, json)
              .success(successFn)
              .error(errorFn);
          },

          //setInfo: function (member) {
          //  $sessionStorage.member = member;
          //},
          //
          //getInfo: function () {
          //  return $sessionStorage.member;
          //},

          goHome: function (noLeft) {
            $ionicHistory.nextViewOptions({
              disableBack: true,
              historyRoot: true
            });

            $state.go('app.home');

            if (angular.isUndefined(noLeft) || !noLeft) {
              $ionicSideMenuDelegate.toggleLeft();
            }
          }

        };
      }])
})();

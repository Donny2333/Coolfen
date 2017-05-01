/**
 * Created by feng on 2015/9/24.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')

    .factory('Auth', ['$http', '$q', '$localStorage', '$rootScope', 'URL_CFG','CoolfenCache', function ($http, $q, $localStorage, $rootScope, URL_CFG,CoolfenCache) {

      var baseUrl = URL_CFG.api + 'Account/';

      var initialize = function () {
        var user = {
          phone: "",
          loggedIn: false,
          addedNewCard: false,
          Username: "",
          BalancePoints: "",
          Tenant: "",
          Gender: "",
          Email: "",
          ID: "",
          Birthday: "",
          isNew: true,
          isMobilePhoneNumberVerified:false,
        };
        var localUser = $localStorage.me;
        if (localUser) {
          user.phone = localUser.phone;
          user.loggedIn = localUser.loggedIn == true;
          user.addedNewCard = localUser.addedNewCard == true;
          user.Username = localUser.Username;
          user.BalancePoints = localUser.BalancePoints;
          user.Tenant = localUser.Tenant;
          user.Gender = localUser.Gender;
          user.Email = localUser.Email;
          user.ID = localUser.ID;
          user.Birthday = localUser.Birthday;
          user.isNew = localUser.isNew;
          user.isMobilePhoneNumberVerified = localUser.isMobilePhoneNumberVerified;
        }

        return user;
      };

      var _me = initialize();

      // 设置当前用户
      var setMe = function (MobilePhoneNumber, login, Username, BalancePoints, Tenant, Gender, Email, ID, Birthday, IsNew,IsMobilePhoneNumberVerified) {
        if (!angular.isUndefined(MobilePhoneNumber))
          _me.phone = MobilePhoneNumber;

        if (!angular.isUndefined(login))
          _me.loggedIn = login;

        if (!angular.isUndefined(Username))
          _me.Username = Username;

        if (!angular.isUndefined(BalancePoints))
          _me.BalancePoints = BalancePoints;

        if (!angular.isUndefined(Tenant))
          _me.Tenant = Tenant;

        if (!angular.isUndefined(Gender))
          _me.Gender = Gender;

        if (!angular.isUndefined(Email))
          _me.Email = Email;

        if (!angular.isUndefined(ID))
          _me.ID = ID;

        if (!angular.isUndefined(Birthday))
          _me.Birthday = Birthday;

        if (!angular.isUndefined(IsNew))
          _me.isNew = IsNew;

        if (!angular.isUndefined(IsMobilePhoneNumberVerified))
          _me.isMobilePhoneNumberVerified = IsMobilePhoneNumberVerified;

        $localStorage.me = _me;
      };

      return {
        getAuthCode: function (MobilePhone) {
          var deferred = $q.defer();

          $http.post(baseUrl + 'AuthCode', MobilePhone)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                deferred.resolve(data.AuthCode);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });

          return deferred.promise;
        },

        getLastAuthCode: function (MobilePhone) {
          var deferred = $q.defer();

          $http.post(baseUrl + 'LastAuthCode', MobilePhone)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                deferred.resolve(data.AuthCode);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });

          return deferred.promise;
        },

        verifyLogin: function () {
          return $http.get(baseUrl + 'MobileUserInfo')
            .success(function (data) {
              if (data.ErrorCode == 0) {
                var Username = data.Value.Username;
                var BalancePoints = data.Value.BalancePoints;
                var Tenant = data.Value.Tenant;
                var Gender = data.Value.Gender;
                var Email = data.Value.Email;
                var ID = data.Value.ID;
                var Birthday = data.Value.Birthday;
                var MobilePhoneNumber = data.Value.MobilePhoneNumber;
                var login = data.Value.MobilePhoneNumber.length == 11;
                var isMobilePhoneNumberVerified = data.Value.IsMobilePhoneNumberVerified;

                setMe(MobilePhoneNumber, login, Username, BalancePoints, Tenant, Gender, Email, ID, Birthday,isMobilePhoneNumberVerified);
                //$rootScope.$emit('Auth:login');
                $rootScope.$broadcast('Auth:login');
              } else {
                setMe(null, false);
              }
            })
            .error(function (err) {
              setMe(null, false);
            });
        },

        // 获取游客身份，并返回零时ID
        CheckIsMobileLogin: function () {
          var deferred = $q.defer();

          if (!_.isEmpty(_me.phone)) {
            deferred.reject(false);
          }
          else {
            $http.post(baseUrl + 'CheckIsMobileLogin')
              .success(function (data) {
                if (data.ErrorCode == 0) {
                  // 保存游客ID，但标示“未登陆”状态
                  CoolfenCache.removeUserCardCache();
                  setMe(data.MobilePhone, false);
                  console.log('1 : Auth.CheckIsMobileLogin');
                  deferred.resolve(true);
                } else {
                  deferred.reject(false);
                }
              })
              .error(function (err) {
                deferred.reject(false);
              });
          }

          return deferred.promise;
        },

        login: function (mobilePhone, authCode) {
          var json = {
            MobilePhone: mobilePhone,
            AuthenticationCode: authCode,
            RememberMe: true,
            ReturnUrl: ''
          };
          var deferred = $q.defer();

          $http.post(baseUrl + 'MobileLogin', json)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                CoolfenCache.removeUserCardCache();
                setMe(mobilePhone, true);
                $localStorage.messageList = null;
                _me.isNew = data.IsNew;
                _me.isMobilePhoneNumberVerified = true;
                $localStorage.me = _me;

                deferred.resolve(data);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });

          return deferred.promise;
        },

        logout: function () {
          var deferred = $q.defer();

          $http.post(baseUrl + 'Logout', '')
            .success(function (data) {
              if (data.ErrorCode == 0) {
                setMe('', false);
                $rootScope.$broadcast('Auth', {login: false});
                deferred.resolve(data);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });

          return deferred.promise;
        },

        // 获取当前用户
        getMe: function () {
          return _me;
        },

        setMe: setMe,  // 设置当前用户

        // 设置用户积分
        setPoint: function (point) {
          _me.BalancePoints = point;
          $localStorage.me = _me;
        },

        // 设置当前用户是否增加新卡
        setAddedNewCard: function (tag) {
          _me.addedNewCard = tag;
          $localStorage.me = _me;
        },

        setIsMobilePhoneNumberVerified:function(verified){
          _me.isMobilePhoneNumberVerified = verified;
          $localStorage.me = _me;
        },

      }
    }])
})();

/**
 * Created by feng on 2015/12/7.
 */
// 分享服务
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')
    .factory('CoolfenShare', ['$http', '$q','CoolfenCache','URL_CFG', function ($http,$q,CoolfenCache,URL_CFG) {
      var getShareCache = function () {
        return CoolfenCache.getObj('ShareContent');
      };
      var setShareCache = function (share) {
        CoolfenCache.setObj('ShareContent', share);
      };

      var getShareContent = function () {
        var deferred = $q.defer();
        var share = getShareCache();

        if (share) {
          deferred.resolve(share);
        }
        else {
          $http.get(URL_CFG.api + 'Card/GetShareContent')
            .success(function (data) {
              if (data.ErrorCode == 0) {
                setShareCache(data.Value);
                deferred.resolve(data.Value);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });
        }

        return deferred.promise;
      };

      return {

        getShareContent: getShareContent,

        //
        shareToWeiXin: function (scene, share,successFn,failFn) {
          window.Wechat.share({
            message: {
              title: share.Message,
              description: share.Subject,
              thumb: share.ImageUrl,
              media: {
                type: window.Wechat.Type.LINK,
                webpageUrl: share.Url
              }
            },
            scene: scene
          }, successFn, failFn);
        },

        shareToQQ: function (share,successFn,failFn) {
          var args = {};
          args.url = share.Url;
          args.title = share.Message;
          args.description = share.Subject;
          args.imageUrl = share.ImageUrl;
          args.appName = "酷分";
          YCQQ.shareToQQ(successFn, failFn, args);
        },

        shareToQZone: function (share,successFn,failFn) {
          var args = {};
          args.url = share.Url;
          args.title = share.Message;
          args.description = share.Subject;
          args.imageUrl = [share.ImageUrl];
          args.appName = "酷分";
          YCQQ.shareToQzone(successFn, failFn, args);
        },

        shareToWeibo: function (share,successFn,failFn) {
          var args = {};
          args.url = share.Url;
          args.title = share.Message;
          args.description = share.Subject;
          args.imageUrl = share.ImageUrl;
          args.defaultText = "";
          YCWeibo.shareToWeibo(successFn, failFn, args);
        },

      }
    }]);
})();

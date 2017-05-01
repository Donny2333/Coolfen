
// 权限服务
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')
    .factory('Merchant', ['$http', '$q', 'CacheFactory', 'URL_CFG','Geolocation', function ($http, $q, CacheFactory, URL_CFG,Geolocation) {
    var baseUrl = URL_CFG.api + 'Merchant/';

    if (!CacheFactory.get('MerchantCache')) {
        CacheFactory('MerchantCache', {
            maxAge: 60 * 1000, // Items added to this cache expire after 1 min
            cacheFlushInterval: 60 * 1000, // This cache will clear itself every 1 min
            deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
            storageMode: 'localStorage' // This cache will use `localStorage`.
        });
    }

    var merchantCache = CacheFactory.get('MerchantCache');

    return {
        getNewMerchant: function () {
            var deferred = $q.defer();
            var newMerchant = merchantCache.get('NewMerchant');

            if (newMerchant) {
                deferred.resolve(newMerchant);
            }
            else {
                var pos = Geolocation.getPosition();
                if(!pos){
                    pos = {
                        lng:0,
                        lat:0,
                    }
                }
                var request = {
                    Count:5,
                    Longitude:pos.lng,
                    Latitude:pos.lat,
                };
                $http.post(baseUrl + 'GetNewMerchants', request)
                    .success(function (data) {
                        if (data.ErrorCode == 0) {
                            merchantCache.put('NewMerchant', data.Outputs);
                            deferred.resolve(data.Outputs);
                        } else {
                            deferred.reject(data.ErrorMessages[0]);
                        }
                    })
                    .error(function (err) {
                        deferred.reject('与服务器连接失败：' + angular.toJson(err));
                    });
            }

            return deferred.promise;
        },

        setCurMerchant: function (merchant) {
            merchantCache.put('CurMerchant', merchant);
        },

        getCurMerchant: function () {
            return merchantCache.get('CurMerchant');
        },

        saveFeedback: function (feedback) {
            var deferred = $q.defer();

            $http.post(URL_CFG.api + 'Interaction/CreateNewFeedBack', feedback)
                .success(function (data) {
                    if (data.ErrorCode == 0) {
                        deferred.resolve(data.Value);
                    } else {
                        deferred.reject(data.ErrorMessages[0]);
                    }
                })
                .error(function (err) {
                    deferred.reject('与服务器连接失败：' + angular.toJson(err));
                });

            return deferred.promise;
        }
    }
}]);
})();

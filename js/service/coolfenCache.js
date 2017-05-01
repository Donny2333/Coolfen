/**
 * Created by feng on 2015/11/24.
 */
// coolfen缓存服务
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')
    .factory('CoolfenCache', ['$http', '$q', 'CacheFactory', 'URL_CFG', 'Toast', function ($http, $q, CacheFactory, URL_CFG, Toast) {

      var baseUrl = URL_CFG.api;

      //region coolfen缓存定义
      if (!CacheFactory.get('Coolfen')) {
        CacheFactory('Coolfen', {
          maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
          cacheFlushInterval: 12 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
          deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
          storageMode: 'localStorage' // This cache will use `localStorage`.
        });
      }
      var coolfenCache = CacheFactory.get('Coolfen');
      //endregion

      //region 公卡缓存定义
      if (!CacheFactory.get('PublicCard')) {
        CacheFactory('PublicCard', {
          maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
          cacheFlushInterval: 4 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
          deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
          storageMode: 'localStorage' // This cache will use `localStorage`.
        });
      }
      var publicCardCache = CacheFactory.get('PublicCard');
      //endregion

      //region 私卡缓存定义
      if (!CacheFactory.get('UserCard')) {
        CacheFactory('UserCard', {
          maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
          cacheFlushInterval: 12 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
          deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
          storageMode: 'localStorage' // This cache will use `localStorage`.
        });
      }
      var userCardCache = CacheFactory.get('UserCard');
      //endregion

      //region 私有方法

      //region global缓存相关方法
      var getObj = function () {
        if (arguments.length == 1) {
          return coolfenCache.get(arguments[0]);
        } else if (arguments.length == 2) {
          return CacheFactory.get(arguments[0]).get(arguments[1]);
        } else {
          return null;
        }
      };

      var setObj = function (key, obj) {
        if (arguments.length == 2) {
          coolfenCache.put(arguments[0], arguments[1]);
        } else if (arguments.length == 3) {
          CacheFactory.get(arguments[0]).put(arguments[1], arguments[2]);
        }
      };

      var getPosition = function(){
        return coolfenCache.get('Position');
      };

      var setPosition = function(pos){
        coolfenCache.put('Position', pos);
      };
      //endregion

      //region PublicCard缓存相关方法
      var getPublicCardIdList = function () {
        return publicCardCache.get('PublicCardIdList');
      };

      var setPublicCardIdList = function (publicCardIdList) {
        publicCardCache.put('PublicCardIdList', publicCardIdList);
      };

      var getPublicCardById = function (publicCardId) {
        var deferred = $q.defer();
        var publicCard = publicCardCache.get(publicCardId);
        if (publicCard) {
          deferred.resolve(publicCard);
        } else {
          $http.post(baseUrl + 'Card/GetPublicCardInfo', {Value: publicCardId})
            .success(function (data) {
              if (data.ErrorCode == 0) {
                setPublicCard(data.Value);
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

      var setPublicCard = function (publicCard, notAutoSet) {
        publicCardCache.put(publicCard.PID, publicCard);
        if (!notAutoSet) {
          var publicCardIdList = getPublicCardIdList();
          if (publicCardIdList.indexOf(publicCard.PID) == -1) {
            publicCardIdList.push(publicCard.PID);
          }
          var timestamp = new Date().valueOf();
          setPublicCardL1CacheTimestamp(timestamp);
        }
      };

      var setPublicCards = function (publicCards) {
        var publicCardIdList = getPublicCardIdList();
        if (publicCardIdList) {
          for (var i = 0; i < publicCardIdList.length; i++) {
            publicCardCache.remove(publicCardIdList[i].PID);
          }
        }
        publicCardIdList = [];
        for (var j = 0; j < publicCards.length; j++) {
          setPublicCard(publicCards[j], true);
          publicCardIdList.push(publicCards[j].PID);
        }
        var timestamp = new Date().valueOf();
        setPublicCardL1CacheTimestamp(timestamp);
        setPublicCardIdList(publicCardIdList);
      };

      var getPublicCardL2Cache = function () {
        var publicCardL1CacheTimestamp = getPublicCardL1CacheTimestamp();
        var publicCardL2CacheTimestamp = getPublicCardL2CacheTimestamp();
        if (publicCardL1CacheTimestamp != publicCardL2CacheTimestamp) {
          var publicCardL2CacheArray = [];
          var publicCardIdList = getPublicCardIdList();
          for (var i = 0; i < publicCardIdList.length; i++) {
            publicCardL2CacheArray.push(publicCardCache.get(publicCardIdList[i]));
          }
          setPublicCardL2Cache(publicCardL2CacheArray, publicCardL1CacheTimestamp);
          return publicCardL2CacheArray;
        }
        return publicCardCache.get('PublicCardL2Cache');
      };

      var setPublicCardL2Cache = function (publicCardArray, timestamp) {
        publicCardCache.put('PublicCardL2Cache', publicCardArray);
        setPublicCardL2CacheTimestamp(timestamp);
      };

      var getPublicCardL1CacheTimestamp = function () {
        return publicCardCache.get('PublicCardL1CacheTimestamp');
      };

      var setPublicCardL1CacheTimestamp = function (timestamp) {
        publicCardCache.put('PublicCardL1CacheTimestamp', timestamp);
      };

      var getPublicCardL2CacheTimestamp = function () {
        return publicCardCache.get('PublicCardL2CacheTimestamp');
      };

      var setPublicCardL2CacheTimestamp = function (timestamp) {
        publicCardCache.put('PublicCardL2CacheTimestamp', timestamp);
      };

      var getPublicCardCacheTime = function () {
        return publicCardCache.get('PublicCardCacheTime');
      };

      var setPublicCardCacheTime = function (cacheTime) {
        publicCardCache.put('PublicCardCacheTime', cacheTime);
      };

      var getPublicCardUpdateTime = function (successFn, errorFn) {
        return $http.post(baseUrl + 'Card/GetPublicCardUpdateTime', '')
          .success(successFn)
          .error(errorFn);
      };

      var getAllPublicCards = function (successFn, errorFn) {
        return $http.post(baseUrl + 'Card/GetAllPublicCards', '')
          .success(successFn)
          .error(errorFn);
      };

      //简单的从缓存里找映射
      var getCurrentPublicCardId = function(){
        var publicCardId = null;
        var currentUserCardId = getCurrentUserCardId();
        if(currentUserCardId) {
          var userCard = userCardCache.get(currentUserCardId);
          if (userCard) {
            publicCardId = userCard.PublicCardOutputSimplify.PID;
          }
        }
        return publicCardId;
      };

      //endregion

      //region UserCard缓存相关方法
      var getUserCardIdList = function () {
        return userCardCache.get('UserCardIdList');
      };

      var setUserCardIdList = function (userCardIdList) {
        userCardCache.put('UserCardIdList', userCardIdList);
      };

      var getUserCardById = function (userCardId) {
        var deferred = $q.defer();
        getUserCardUpdateTimeById(userCardId, function (data) {
          if (data.ErrorCode == 0) {
            var card = userCardCache.get(userCardId);
            var userCardCacheTime = getUserCardCacheTimeById(userCardId);
            if (card && data.Value == userCardCacheTime) {
              setUserCardCacheTime(userCardId, data.Value);
              deferred.resolve(card);
            } else {
              getUserCardInfo(userCardId, function (data1) {
                if (data1.ErrorCode == 0) {
                  setUserCard(data1.Value, false);
                  setUserCardCacheTime(userCardId, data.Value);
                  deferred.resolve(data1.Value);
                } else {
                  deferred.reject(data1.ErrorMessages[0]);
                }
              }, function (err1) {
                deferred.reject('与服务器连接失败：' + angular.toJson(err1));
              });
            }
          } else {
            deferred.reject(data.ErrorMessages[0]);
          }
        }, function (err) {
          deferred.reject('与服务器连接失败：' + angular.toJson(err));
        });
        return deferred.promise;
      };

      var getUserCardByIdOnlyFromCache = function(userCardId){
        return userCardCache.get(userCardId);
      };

      var setUserCard = function (userCard, notAutoSet) {
        userCardCache.put(userCard.UserCardID, userCard);
        if (!notAutoSet) {
          var userCardIdList = getUserCardIdList();
          if (userCardIdList.indexOf(userCard.UserCardID) == -1) {
            userCardIdList.push(userCard.UserCardID);
          }
        }
      };

      var setUserCards = function (userCards) {
        var userCardIdList = getUserCardIdList();
        if (userCardIdList) {
          for (var i = 0; i < userCardIdList.length; i++) {
            userCardCache.remove(userCardIdList[i].UserCardID);
          }
        }
        userCardIdList = [];
        for (var j = 0; j < userCards.length; j++) {
          setUserCard(userCards[j], true);
          userCardIdList.push(userCards[j].UserCardID);
        }
        setUserCardIdList(userCardIdList);
      };

      var getUserCards = function () {
        var userCards = [];
        var userCardIdList = getUserCardIdList();
        if (userCardIdList) {
          for (var i = 0; i < userCardIdList.length; i++) {
            userCards.push(userCardCache.get(userCardIdList[i]));
          }
        }
        return userCards;
      };

      var getUserCardCacheTimeById = function (userCardId) {
        return userCardCache.get('UserCardCacheTime_' + userCardId);
      };

      var setUserCardCacheTime = function (userCardId, cacheTime) {
        userCardCache.put('UserCardCacheTime_' + userCardId, cacheTime);
      };

      var getUserCardUpdateTimeById = function (userCardId, successFn, errorFn) {
        return $http.post(baseUrl + 'Card/GetUserCardUpdateTime', {Value: userCardId})
          .success(successFn)
          .error(errorFn);
      };

      var getUserCardInfo = function (userCardId, successFn, errorFn) {
        return $http.post(baseUrl + 'Card/GetUserCardInfo', {Value: userCardId})
          .success(successFn)
          .error(errorFn);
      };

      var getAllUserCards = function (successFn, errorFn) {
        return $http.post(baseUrl + 'Card/GetAllUserCards')
          .success(successFn)
          .error(errorFn);
      };

      var getCurrentUserCardId = function(){
        return userCardCache.get('CurrentUserCardId');
      };

      var setCurrentUserCardId = function(userCardId){
        userCardCache.put('CurrentUserCardId',userCardId);
      };

      var removeCurrentUserCardId = function(){
        userCardCache.remove('CurrentUserCardId');
      };

      var getCurrentUserCard = function(){
        var deferred = $q.defer();
        var currentUserCardId = getCurrentUserCardId();
        if(currentUserCardId){
          getUserCardById(currentUserCardId).then(function(userCard){
            deferred.resolve(userCard);
          },function(err){
            deferred.reject(err);
          });
        }
        return deferred.promise;
      };

      var setCurrentUserCard = function(userCard){
        setUserCard(userCard,false);
        setCurrentUserCardId(userCard.UserCardID);
      };

      var removeUserCardById = function(userCardId){
        var userCardIdList = getUserCardIdList();
        var index = userCardIdList.indexOf(userCardId);
        userCardIdList.splice(index,1);
        setUserCardIdList(userCardIdList);
        userCardCache.remove(userCardId);
      };

      //endregion

      //endregion

      return {
        //region global缓存
        getObj: getObj,
        setObj: setObj,
        getPosition:getPosition,
        setPosition:setPosition,
        //endregion

        //region 公卡缓存

        //region 根据id获取公卡
        getPublicCardById: getPublicCardById,
        //endregion

        //region 设置单个公卡的缓存
        setPublicCard: function (publicCard) {
          setPublicCard(publicCard, false);
        },
        //endregion

        //region 获取所有公卡
        getPublicCards: function () {
          var deferred = $q.defer();
          getPublicCardUpdateTime(function (data) {
            if (data.ErrorCode == 0) {
              setPublicCardCacheTime(data.Value);
              var cards = getPublicCardL2Cache();
              if (cards && data.Value == getPublicCardCacheTime()) {
                deferred.resolve(cards);
              } else {
                getAllPublicCards(function (data1) {
                  if (data1.ErrorCode == 0) {
                    setPublicCards(data1.Outputs);
                    cards = getPublicCardL2Cache();
                    return deferred.resolve(cards);
                  } else {
                    deferred.reject(data1.ErrorMessages[0]);
                  }
                }, function (err1) {
                  deferred.reject('与服务器连接失败：' + angular.toJson(err1));
                });
              }
            } else {
              deferred.reject(data.ErrorMessages[0]);
            }
          }, function (err) {
            deferred.reject('与服务器连接失败：' + angular.toJson(err));
          });
          return deferred.promise;
        },
        //endregion

        //region 获取置顶卡缓存
        getTopCardCache: function () {
          return publicCardCache.get('TopCards');
        },
        //endregion

        //region 设置置顶卡缓存
        setTopCardCache: function (cards) {
          publicCardCache.put('TopCards', cards);
        },
        //endregion

        //region 根据当前公卡id
        getCurrentPublicCardId: getCurrentPublicCardId,
        //endregion

        //endregion

        //region 私卡缓存

        //region 根据id获取私卡
        getUserCardById: getUserCardById,
        //endregion

        //region 根据id获取私卡
        getUserCardByIdOnlyFromCache: getUserCardByIdOnlyFromCache,
        //endregion

        //region 设置单个私卡的缓存
        setUserCard: function (userCard) {
          setUserCard(userCard, false);
        },
        //endregion

        //region 获取所有私卡
        getUserCards: function (forceRefresh) {
          var deferred = $q.defer();
          var cards = getUserCards();
          // 强制刷新
          if (_.isUndefined(forceRefresh)) {
            forceRefresh = false;
          }
          if (cards.length != 0 && !forceRefresh) {
            deferred.resolve(cards);
          } else {
            getAllUserCards(function (data) {
              if (data.ErrorCode == 0) {
                setUserCards(data.Outputs);
                cards = getUserCards();
                deferred.resolve(cards);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            }, function (err) {
              deferred.reject(data.ErrorMessages[0]);
            });
          }
          return deferred.promise;
        },
        //endregion

        //region 获取所有私卡
        getUserCardsOnlyFromCache:getUserCards,
        //endregion

        //region 清除所有私卡缓存
        removeUserCardCache: function () {
          userCardCache.removeAll();
        },
        //endregion

        //region 获取当前私卡id
        getCurrentUserCardId: getCurrentUserCardId,
        //endregion

        //region 设置当前私卡id
        setCurrentUserCardId: setCurrentUserCardId,
        //endregion

        //region 清除当前私卡id
        removeCurrentUserCardId: removeCurrentUserCardId,
        //endregion

        //region 获取当前私卡
        getCurrentUserCard:getCurrentUserCard,
        //endregion

        //region 设置当前私卡
        setCurrentUserCard:setCurrentUserCard,
        //endregion

        //region 设置当前私卡
        removeUserCardById:removeUserCardById
        //endregion

        //endregion

      }
    }]);
})();

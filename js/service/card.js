// 卡服务
(function () {
    "use strict";

    angular.module('CoolfenMobileApp.services')
        .factory('Card', function ($http, $q, CacheFactory, Auth, URL_CFG, Toast, CoolfenCache) {
            var baseUrl = URL_CFG.api;

            if (!CacheFactory.get('PublicCardCache')) {
                CacheFactory('PublicCardCache', {
                    maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
                    cacheFlushInterval: 4 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
                    deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
                    storageMode: 'localStorage' // This cache will use `localStorage`.
                });
            }

            if (!CacheFactory.get('PublicCardTimeCache')) {
                CacheFactory('PublicCardTimeCache', {
                    maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
                    cacheFlushInterval: 12 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
                    deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
                    storageMode: 'localStorage' // This cache will use `localStorage`.
                });
            }

            var publicCardCache = CacheFactory.get('PublicCardCache');
            var publicCardTimeCache = CacheFactory.get('PublicCardTimeCache');

            if (!CacheFactory.get('UserCardCache')) {
                CacheFactory('UserCardCache', {
                    maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
                    cacheFlushInterval: 12 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
                    deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
                    storageMode: 'localStorage' // This cache will use `localStorage`.
                });
            }
            if (!CacheFactory.get('UserCardTimeCache')) {
                CacheFactory('UserCardTimeCache', {
                    maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
                    cacheFlushInterval: 12 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
                    deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
                    storageMode: 'localStorage' // This cache will use `localStorage`.
                });
            }

            var userCardCache = CacheFactory.get('UserCardCache');
            var userCardTimeCache = CacheFactory.get('UserCardTimeCache');

            return {
                //// 获取公共卡
                //getPublicCards: function () {
                //  var deferred = $q.defer();
                //  var cards = publicCardCache.get('PublicCards');
                //  var publicCardCacheTime = publicCardTimeCache.get("PublicCardCacheTime");
                //  //判断从服务器获取的最新商家更新时间和缓存商家更新时间是否一致
                //  this.getPublicCardUpdateTime().then(function (data) {
                //      if (cards && data == publicCardCacheTime) {
                //        deferred.resolve(cards);
                //      }
                //      else {
                //        $http.post(baseUrl + 'Card/GetAllPublicCards', '')
                //          .success(function (data) {
                //            if (data.ErrorCode == 0) {
                //              publicCardCache.put('PublicCards', data.Outputs);
                //              deferred.resolve(data.Outputs);
                //            } else {
                //              deferred.reject(data.ErrorMessages[0]);
                //            }
                //          })
                //          .error(function (err) {
                //            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                //          });
                //      }
                //    }, function (err) {
                //      Toast.show(err);
                //    }
                //  )
                //  return deferred.promise;
                //},
                //NewCacheLogic
                getPublicCards: CoolfenCache.getPublicCards,

                //获取公卡最新更新时间
                getPublicCardUpdateTime: function () {
                    var deferred = $q.defer();
                    $http.post(baseUrl + 'Card/GetPublicCardUpdateTime', '')
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                publicCardTimeCache.put("PublicCardCacheTime", data.Value);
                                deferred.resolve(data.Value);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });
                    return deferred.promise;
                },

                //获取公共卡缓存
                getPublicCardCache: function () {
                    return publicCardCache.get('PublicCards');
                },

                // 设置公共卡本地缓存
                setPublicCardCache: function (cards) {
                    publicCardCache.remove('PublicCards');
                    publicCardCache.put('PublicCards', cards);
                },

                // 获取用户卡本地缓存
                getUserCardCache: function () {
                    return userCardCache.get('UserCards');
                },

                // 设置用户卡本地缓存
                setUserCardCache: function (cards) {
                    userCardCache.remove('UserCards');
                    userCardCache.put('UserCards', cards);
                },

                //// 删除用户卡本地缓存
                //removeUserCardCache: function () {
                //  userCardCache.remove('UserCards');
                //},
                //NewCacheLogic
                removeUserCardCache: CoolfenCache.removeUserCardCache,

                //// 获取置顶卡本地缓存
                //getTopCardCache: function () {
                //  return publicCardCache.get('TopCards');
                //},
                //NewCacheLogic
                getTopCardCache: CoolfenCache.getTopCardCache,

                //// 设置置顶卡本地缓存
                //setTopCardCache: function (cards) {
                //  publicCardCache.remove('TopCards');
                //  publicCardCache.put('TopCards', cards);
                //},
                setTopCardCache: CoolfenCache.setTopCardCache,

                //// 删除置顶卡本地缓存
                //removeTopCardCache: function () {
                //  publicCardCache.remove('TopCards');
                //},


                // 获取用户卡/置顶卡
                //getUserCards: function (forceRefresh) {
                //  var deferred = $q.defer(),
                //    cards = null;
                //
                //  // 强制刷新
                //  if (_.isUndefined(forceRefresh)) {
                //    forceRefresh = false;
                //  }
                //
                //  if (!forceRefresh) {
                //    cards = userCardCache.get('UserCards');
                //  }
                //
                //  if (cards) {
                //    deferred.resolve(cards);
                //  } else {
                //    $http.post(baseUrl + 'Card/GetAllUserCards')
                //      .success(function (data) {
                //        if (data.ErrorCode == 0) {
                //          deferred.resolve(data.Outputs);
                //        } else {
                //          deferred.reject(data.ErrorMessages[0]);
                //        }
                //      })
                //      .error(function (err) {
                //        deferred.reject('与服务器连接失败：' + angular.toJson(err));
                //      });
                //  }
                //
                //  return deferred.promise;
                //},
                getUserCards: CoolfenCache.getUserCards,

                getUserCardsOnlyFromCache:CoolfenCache.getUserCardsOnlyFromCache,

                //// 新增用户卡
                //addUserCard: function (card) {
                //    var deferred = $q.defer();
                //    var json = {
                //        MobilePhone: Auth.getMe().phone,
                //        CardIDList: [card.PID]
                //    };
                //
                //    $http.post(baseUrl + 'Card/AddUserCards', json)
                //        .success(function (data) {
                //            if (data.ErrorCode == 0) {
                //                CoolfenCache.setUserCard(data.Outputs[0]);
                //                deferred.resolve(data.Outputs[0]);
                //            } else {
                //                deferred.reject(data.ErrorMessages[0]);
                //            }
                //        })
                //        .error(function (err) {
                //            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                //        });
                //
                //    return deferred.promise;
                //},
                addUserCard: function (card) {
                    var deferred = $q.defer();
                    var json = {
                        MobilePhone: Auth.getMe().phone,
                        CardId: card.PID
                    };

                    $http.post(baseUrl + 'Card/AddUserCard', json)
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                CoolfenCache.setUserCard(data.Value);
                                deferred.resolve(data.Value);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                //// 获取公共卡的详情
                //getPublicCardInfo: function (pid) {
                //    var deferred = $q.defer();
                //    var card = publicCardCache.get(pid);
                //
                //    if (card) {
                //        deferred.resolve(card);
                //    } else {
                //        $http.post(baseUrl + 'Card/GetPublicCardModel', {Value: pid})
                //            .success(function (data) {
                //                if (data.ErrorCode == 0) {
                //                    publicCardCache.put(pid, data.Outputs[0]);
                //                    deferred.resolve(data.Outputs[0]);
                //                } else {
                //                    deferred.reject(data.ErrorMessages[0]);
                //                }
                //            })
                //            .error(function (err) {
                //                deferred.reject('与服务器连接失败：' + angular.toJson(err));
                //            });
                //    }
                //
                //    return deferred.promise;
                //},
                getPublicCardInfo:CoolfenCache.getPublicCardById,

                //// 获取用户卡的详情
                //getUserCardInfo: function (uid) {
                //    var deferred = $q.defer();
                //    var card = userCardCache.get(uid);
                //    var userCardCacheTime = userCardTimeCache.get(uid);
                //    this.getUserCardUpdateTime(uid).then(function (data) {
                //            if (card && data == userCardCacheTime) {
                //                deferred.resolve(card);
                //            }
                //            else {
                //                $http.post(baseUrl + 'Card/GetUserCardModel', {Value: uid})
                //                    .success(function (data) {
                //                        if (data.ErrorCode == 0) {
                //                            userCardCache.remove(uid);
                //                            userCardCache.put(uid, data.Outputs[0]);
                //                            deferred.resolve(data.Outputs[0]);
                //                        } else {
                //                            deferred.reject(data.ErrorMessages[0]);
                //                        }
                //                    })
                //                    .error(function (err) {
                //                        deferred.reject('与服务器连接失败：' + angular.toJson(err));
                //                    });
                //            }
                //        }, function (err) {
                //            Toast.show(err);
                //        }
                //    )
                //    return deferred.promise;
                //},
                getUserCardInfo:CoolfenCache.getUserCardById,

                //获取私卡更新时间
                getUserCardUpdateTime: function (uid) {
                    var deferred = $q.defer();
                    $http.post(baseUrl + 'Card/GetUserCardModelUpdateTime', {Value: uid})
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                userCardTimeCache.remove(uid);
                                userCardTimeCache.put(uid, data.Value);
                                deferred.resolve(data.Value);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });
                    return deferred.promise;
                },

                // 根据公卡ID获取用户卡的详情
                getUserCardModelByPublicCardId: function (pid) {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Card/GetUserCardModelByPublicCardId', {Value: pid})
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                userCardCache.put(data.Outputs[0].UserCardID, data.Outputs[0]);
                                deferred.resolve(data.Outputs[0]);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                //获取卡的积分
                getUserCardPoint: function (cardId) {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Card/GetUserCardPoint', {Value: cardId})
                        .success(function (data) {
                            //if (data.ErrorCode == 0) {
                            //    deferred.resolve(data.Value);
                            //} else {
                            //    deferred.reject(data.ErrorMessages[0]);
                            //}
                            deferred.resolve(data);
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                //// 获取位置
                //getPosition: function () {
                //    return userCardCache.get('Position');
                //},
                getPosition:CoolfenCache.getPosition,

                //// 设置位置
                //setPosition: function (pos) {
                //    userCardCache.remove('Position');
                //    userCardCache.put('Position', pos);
                //},
                setPosition:CoolfenCache.setPosition,

                //// 获取当前卡的卡ID
                //getCurCardId: function () {
                //    return userCardCache.get('CurCardId');
                //},
                getCurCardId:CoolfenCache.getCurrentUserCardId,

                //// 设置当前卡的卡ID
                //setCurCardId: function (id) {
                //    userCardCache.remove('CurCardId');
                //    userCardCache.put('CurCardId', id);
                //},
                setCurCardId:CoolfenCache.setCurrentUserCardId,

                getCurrentPublicCardId:CoolfenCache.getCurrentPublicCardId,

                //// 清除当前卡的卡ID
                //removeCurCardId: function () {
                //    userCardCache.remove('CurCardId');
                //},
                removeCurCardId:CoolfenCache.removeCurrentUserCardId,

                //// 获取当前卡详情的本地缓存
                //getCurCardDetail: function () {
                //  return publicCardCache.get('CurCardDetail');
                //},
                //
                //// 设置当前卡详情的本地缓存
                //setCurCardDetail: function (card) {
                //  publicCardCache.remove('CurCardDetail');
                //  publicCardCache.put('CurCardDetail', card);
                //},

                //getCurUserCard: function () {
                //    return userCardCache.get('CurUserCard');
                //},
                getCurUserCard:CoolfenCache.getCurrentUserCard,

                //setCurUserCard: function (userCard) {
                //    userCardCache.remove('CurUserCard');
                //    userCardCache.put('CurUserCard', userCard);
                //},
                setCurUserCard:CoolfenCache.setCurrentUserCard,

                //getUserCardById: function (id) {
                //    return userCardCache.get(id);
                //},
                getUserCardById:CoolfenCache.getUserCardById,

                getUserCardByIdOnlyFromCache:CoolfenCache.getUserCardByIdOnlyFromCache,

                //setUserCard: function (userCard) {
                //    userCardCache.remove(userCard.UserCardID);
                //    userCardCache.put(userCard.UserCardID, userCard);
                //},
                setUserCard:CoolfenCache.setUserCard,

                // 获取账单
                getBills: function (uid) {
                    var deferred = $q.defer();
                    var json = {
                        UserCardID: uid,
                        QueryType: 1,
                        QueryKey: '',
                        PageIndex: -1,
                        PageSize: 5
                    };

                    $http.post(baseUrl + 'Transaction/GetMobileUserExpenseCalendar', json)
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                deferred.resolve(data.Outputs);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                // 第一次输入持卡人ID，消费金额获得所有的交易信息
                getMaxUsePointByExpense: function (json, successFn, errorFn) {
                    return $http.post(baseUrl + 'Transaction/MobileUserGetMaxUsePointByExpense', json)
                        .success(successFn)
                        .error(errorFn);
                },

                // 第二次输入持卡人ID，消费金额获得所有的交易信息
                getUsePointByExpense: function (json, successFn, errorFn) {
                    return $http.post(baseUrl + 'Transaction/MobileUserGetUsePointByExpense', json)
                        .success(successFn)
                        .error(errorFn);
                },

                // 获取分类和区域
                getCategoryAndDistrictList: function () {
                    var deferred = $q.defer();
                    var categories = publicCardCache.get('Categories');

                    if (categories) {
                        deferred.resolve(categories);
                    }
                    else {
                        $http.post(baseUrl + 'Card/GetCategoryAndDistrictList', '')
                            .success(function (data) {
                                if (data.ErrorCode == 0) {
                                    publicCardCache.put('Categories', data.Value);
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
                },

                // 获取排行榜信息
                getRank: function (startDate, endDate, topNum) {
                    var deferred = $q.defer();
                    var json = {
                        StartDate: startDate,
                        EndDate: endDate,
                        TopNum: topNum
                    };

                    $http.post(URL_CFG.api + 'Card/GetSaveMoneyRanking', json)
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                deferred.resolve(data.Outputs);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                // 创建纯积分订单信息
                createNewPointsTransaction: function (json) {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Transaction/MobileUserCreateNewPointsTransaction', json)
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
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

                // 创建订单信息
                createNewTransaction: function (json) {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Transaction/MobileUserCreateNewTransaction', json)
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
                },

                // 根据前台反馈修改支付结果
                setMobileUserPayResult: function (json) {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Transaction/GetMobileUserPayResult ', json)
                        .success(function (data) {
                            if (data.Value == "支付失败") {
                                deferred.reject("支付失败");
                            }
                            else if (data.ErrorCode == 0) {
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

                // 获取分享内容
                getShareContent: function () {
                    var deferred = $q.defer();
                    var share = publicCardCache.get('ShareContent');

                    if (share) {
                        deferred.resolve(share);
                    }
                    else {
                        $http.get(baseUrl + 'Card/GetShareContent')
                            .success(function (data) {
                                if (data.ErrorCode == 0) {
                                    publicCardCache.put('ShareContent', data.Value);
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
                },

                //移除UserCard
                suspendUserCard: function (cardId, successFn, errorFn) {
                    var json = {
                        Value: cardId
                    };

                    return $http.post(baseUrl + 'Card/SuspendUserCard', json)
                        .success(successFn)
                        .error(errorFn);
                },

                //吸分
                getExtractPoints: function (json, successFn, errorFn) {
                    return $http.post(baseUrl + 'Card/ExtractPoints', json)
                        .success(successFn)
                        .error(errorFn);
                },

                //是否储值卡商家
                isPrepaidCardMerchant: function (merchantId, successFn, errorFn) {
                    return $http.post(baseUrl + 'Merchant/IsPrepaidCardMerchantByMerchantId', merchantId)
                        .success(successFn)
                        .error(errorFn);
                },
                //获取水球信息
                getBallInfo: function (cardId, successFn, errorFn) {
                    return $http.post(baseUrl + 'Card/GetBallInfo', cardId)
                        .success(successFn)
                        .error(errorFn);
                },
                //积分规则的获取
                getUsePointInformation: function (cardId, successFn, errorFn) {
                    return $http.post(baseUrl + 'Transaction/GetUsePointInformation', cardId)
                        .success(successFn)
                        .error(errorFn);
                },

                getCoolfenFriends: function () {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Transaction/CoolFenFriend')
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                deferred.resolve(data.Outputs);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

                //获取商家分店
                getMobileUserGetMerchantList: function () {
                    var deferred = $q.defer();

                    $http.post(baseUrl + 'Transaction/MobileUserGetMerchantList')
                        .success(function (data) {
                            if (data.ErrorCode == 0) {
                                deferred.resolve(data.Outputs);
                            } else {
                                deferred.reject(data.ErrorMessages[0]);
                            }
                        })
                        .error(function (err) {
                            deferred.reject('与服务器连接失败：' + angular.toJson(err));
                        });

                    return deferred.promise;
                },

               //获取热门
              getHotSearch: function(){
                var deferred = $q.defer();

                $http.post(baseUrl + 'Card/GetHotSearch')
                  .success(function (data) {
                    if (data) {
                      deferred.resolve(data);
                    } else {
                      deferred.reject(data);
                    }
                  })
                  .error(function (err) {
                    deferred.reject('与服务器连接失败：' + angular.toJson(err));
                  });

                return deferred.promise;
              },
              setPublicCard: function(publicCard){
                CoolfenCache.setPublicCard(publicCard);
              }

            };
        });

})();

/**
 * Created by Donny on 2015/10/9.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('searchCtrl', function ($scope, $rootScope, $ionicBackdrop, $state, $ionicLoading, $ionicScrollDelegate, $filter, $timeout, Geolocation, URL_CFG, Auth, Card, Toast, user, $ionicHistory, CacheFactory, $localStorage) {
      var vm = $scope.vm = {};
      vm.results = [];
      vm.showQueryInput = false;
      vm.queryString = "";
      vm.showQueryResult = false;
      vm.arr = $localStorage.list ? $localStorage.list : [];
      var closeQueryResult = true;
      $scope.searchShow = true;

      vm.sort = 'distance';
      $scope.publicCards = [];
      $scope.url = URL_CFG.img;
      $scope.loginStates = Auth.getMe().loggedIn;
      $scope.pagination = {
        items: [],
        source: [],
        rowsPerPage: 20,
        totalItems: 0,
        pageIndex: 0,
        pageSize: 0,
        canLoaded: true
      };

      $scope.winW = $(window).width();
      $scope.searchW = $(window).width() - 100;
      $scope.showQueryH = 44;
      $scope.resultShow = false;
      $scope.closeShow = true;

      if (ionic.Platform.isIOS()) {
        $scope.showQueryH = 44 + 19;
      }

      if (!CacheFactory.get('SearchHistoryCache')) {
        CacheFactory('SearchHistoryCache', {
          maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
          cacheFlushInterval: 4 * 60 * 60 * 1000, // This cache will clear itself every 12 hour
          deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
          storageMode: 'localStorage' // This cache will use `localStorage`.
        });
      }

      $rootScope.$on('Auth:login', function () {
        //updateCards();
        getPublicCards();
      })

      //$scope.$watch('vm.showQueryResult', function (sqr) {
      //  if (sqr) {
      //    $('.myBackdrop').addClass("visible active");
      //  } else {
      //    $('.myBackdrop').removeClass("visible active");
      //  }
      //});

      $scope.$on("$ionicView.beforeEnter", function () {
        $scope.arr = $localStorage.list;
        getHot();
      })

      $scope.$on('auth:positionChanged', function (event, pos) {
        updateCardsLocation(pos);

        if (vm.sort == 'distance') {
          // 按距离从近到远排序
          $scope.pagination.source = $filter('orderBy')($scope.publicCards, 'distance');

          // 针对已经出现的卡排序
          var distance, roundedDistance, min;

          for (var i = 0; i < $scope.pagination.items.length; i++) {
            _.forEach($scope.pagination.items[i].PAddresses, function (address, key) {
              distance = Geolocation.getDistance(
                pos.lng,
                pos.lat,
                parseFloat(address.Coordinate.Longitude),
                parseFloat(address.Coordinate.Latitude)
              );

              roundedDistance = Math.round(distance * 10) / 10;

              if (key == 0) {
                min = roundedDistance;
              } else {
                if (roundedDistance > min) {
                  min = roundedDistance;
                }
              }
            });

            $scope.pagination.items[i].distance = min;
          }

          $scope.pagination.items = $filter('orderBy')($scope.pagination.items, 'distance');
        }
      });

      getPublicCards(); // 获取公共卡

      // 每隔1分钟检索一次用户的位置，如果不同，就重新计算距离
      Geolocation.watchGeoLocation();

      $scope.goHome = function () {
        user.goHome(true);
      };

      $scope.onClear = function () {
        $scope.vm.queryString = "";
        $scope.closeShow = true;
        $scope.resultShow = false;
        $scope.searchShow = true;
        vm.rs = false;
      };

      // 新增用户卡
      $scope.addUserCard = function (card) {
        if (card.isAdded) {
          var userCards = Card.getUserCardsOnlyFromCache();
          for (var i = 0; i < userCards.length; i++) {
            var userCard = userCards[i];
            if (userCard.PublicCardOutputSimplify.PID == card.PID) {
              Card.setCurCardId(userCard.UserCardID);
              break;
            }
          }
          //Card.setCurCardId(card.PID);
          $rootScope.$broadcast('home.SwipeToCard');
          user.goHome(true);
          //Toast.show('该卡已拥有');
          return;
        }
        $ionicLoading.show({
          template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
          showBackdrop: true
        });

        Card.addUserCard(card).then(function (data) {
          card.isAdded = true;
          card.Mans = data.PublicCardOutputSimplify.Mans;
          //console.log(data);
          Card.setCurUserCard(data);
          Auth.setAddedNewCard(true);
          Auth.setPoint(Number(Auth.getMe().BalancePoints) + data.Points);
          $rootScope.$broadcast('user:update', {refreshCardBag: true});
          $rootScope.$broadcast('cards:addUserCard2', {PID: data.PublicCardOutputSimplify.PID});
          user.goHome(true);
          //Toast.show('新增用户卡成功');
        }, function (err) {
          $ionicLoading.hide();
          Toast.show(err);
        }).finally(function () {
          $ionicLoading.hide();
          //card.setPublicCardCache(card);
        });
      };

      // 加载分页的公共卡
      $scope.loadMore = function () {
        // 如果到了最后一页，则停止下拉更新
        if ($scope.pagination.pageIndex + 1 == $scope.pagination.pageSize) {
          $scope.pagination.canLoaded = false;
          return;
        }

        $scope.pagination.pageIndex++;

        var start = $scope.pagination.rowsPerPage * $scope.pagination.pageIndex;
        var end = start + $scope.pagination.rowsPerPage;
        var items = $scope.pagination.source.slice(start, end);

        for (var i = 0; i < items.length; i++) {
          $scope.pagination.items.push(items[i]);
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
      };

      // 获取公共卡
      function getPublicCards() {
        $ionicLoading.show({
          template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中...',
          showBackdrop: true
        });

        // 分页初始化
        //$scope.publicCards = [];
        $scope.pagination.items = [];
        $scope.pagination.source = [];
        $scope.pagination.canLoaded = true;


        Card.getPublicCards().then(function (data) {
          populateFindCardList(data);
        }, function (err) {

          Toast.show(err);
        }).finally(function () {
        })
      }

      // 填充发现卡列表
      function populateFindCardList(publicCards) {
        var comparedCards;
        //每次都要求用新请求到的get all usercard做比较
        Card.getUserCards(true).then(function (newUserCardData) {
          comparedCards = newUserCardData;
          AddTagFromMatchedCard1(publicCards, comparedCards);

          firstPaged(publicCards, true);    // 首次分页
        }, function (err) {
          Toast.show(err);
          $ionicLoading.hide();
        })
          .finally(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $ionicLoading.hide();
          });
      }

      // 公共卡和用户卡的匹配
      function AddTagFromMatchedCard1(publicCards, comparedCards) {
        for (var index in publicCards) {
          if (publicCards.hasOwnProperty(index)) {
            var findMatchedCard = _.find(comparedCards, {PublicCardOutputSimplify: {PID: publicCards[index].PID}});

            if (findMatchedCard && findMatchedCard.Status == "useable") {
              publicCards[index].isAdded = true;
            } else {
              publicCards[index].isAdded = false;
            }
          }
        }
      }

      // 更新卡
      function updateCards() {
        var comparedCards;
        var publicCards = $scope.publicCards;
        // 分页初始化
        $scope.publicCards = [];
        $scope.pagination.items = [];
        $scope.pagination.source = [];
        $scope.pagination.canLoaded = true;

        if (Auth.getMe().loggedIn) {
          //每次都要求用新请求到的get all usercard做比较
          Card.getUserCards(true).then(function (newUserCardData) {
            comparedCards = newUserCardData;
            AddTagFromMatchedCard1(publicCards, comparedCards);

            firstPaged(publicCards);    // 首次分页
          });
        }
        //如果没有登录，可以先从cache里拿之前存过的top listcard做比较
        else {
          comparedCards = Card.getTopCardCache();

          if (typeof comparedCards == 'undefined') {
            Card.getUserCards(true).then(function (newUserCardData) {
              for (var index in newUserCardData) {
                if (newUserCardData.hasOwnProperty(index)) {
                  newUserCardData[index]['checked'] = false;
                  newUserCardData[index]['isUpdated'] = true;
                }
              }

              comparedCards = newUserCardData;
              Card.setTopCardCache(newUserCardData);
              AddTagFromMatchedCard2(publicCards, comparedCards);
              firstPaged(publicCards);    // 首次分页
            }).finally(function () {
            })
          }
          else {
            AddTagFromMatchedCard2(publicCards, comparedCards);
            firstPaged(publicCards);    // 首次分页
          }
        }
      }

      // 更新卡的位置
      function updateCardsLocation(pos) {
        var distance, roundedDistance, min;
        for (var index in $scope.publicCards) {
          if ($scope.publicCards.hasOwnProperty(index)) {
            _.forEach($scope.publicCards[index].PAddresses, function (address, key) {
              distance = Geolocation.getDistance(
                pos.lng,
                pos.lat,
                parseFloat(address.Coordinate.Longitude),
                parseFloat(address.Coordinate.Latitude)
              );

              roundedDistance = Math.round(distance * 10) / 10;

              if (key == 0) {
                min = roundedDistance;
              } else {
                if (roundedDistance > min) {
                  min = roundedDistance;
                }
              }
            });

            $scope.publicCards[index].distance = min;
          }
        }
      }

      // 首次分页
      function firstPaged(publicCards, isPosition) {
        // 保存公共卡
        $scope.publicCards = publicCards;

        if (isPosition) {
          var pos = Geolocation.getPosition();

          // 根据用户坐标计算用户到商户的距离
          if (pos) {
            // 更新距离
            updateCardsLocation(pos);

            // 按距离从近到远排序
            $scope.pagination.source = $filter('orderBy')($scope.publicCards, 'distance');
          } else {
            $scope.pagination.source = $scope.publicCards;
          }
        } else {
          // 过滤
          var buf = $filter('filter')($scope.publicCards, vm.filter);

          // 排序
          $scope.pagination.source = $filter('orderBy')(buf, vm.sort);
        }

        $scope.pagination.totalItems = $scope.pagination.source.length;
        $scope.pagination.pageSize = parseInt($scope.pagination.totalItems / $scope.pagination.rowsPerPage);
        $scope.pagination.pageIndex = 0;

        // 如果数组长度不是分页项目数的整数倍，则页数加1
        if ($scope.pagination.totalItems % $scope.pagination.rowsPerPage != 0) {
          $scope.pagination.pageSize++;
        }

        // 如果到了最后一页，则停止下拉更新
        if ($scope.pagination.pageIndex + 1 == $scope.pagination.pageSize) {
          $scope.pagination.canLoaded = false;
        }

        // 第一页20条数据
        var items = $scope.pagination.source.slice(0, $scope.pagination.rowsPerPage);

        for (var i = 0; i < items.length; i++) {
          $scope.pagination.items.push(items[i]);
        }
      }

      $scope.switchQueryInput = function (showQueryInput) {
        if (showQueryInput) {
          $scope.closeQueryInput();
        } else {
          $scope.openQueryInput();
        }
      }

      $scope.$watch("vm.queryString", function (value) {
        if (value && value.length > 0) {
          $timeout(function () {
            //$scope.$apply(function () {
            vm.results = getSuggestCardNameList(value, 8);
            $scope.length = vm.results.length;
            //});
          }, 0);
          $scope.closeShow = false;
          vm.showQueryResult = true;
          $scope.searchShow = false;
        } else {
          vm.showQueryResult = false;
          $scope.searchShow = true;
          $scope.resultShow = false;
          $scope.closeShow = true;
        }
      })

      // 打开搜索提示页面
      $scope.openQueryResult = function () {
        $scope.resultShow = false;
        $scope.searchShow = false;
        vm.rs = false;
        if (!vm.queryString) {
          return;
        }

        if (vm.queryString.length > 0) {
          vm.showQueryResult = true;

          $timeout(function () {
            closeQueryResult = false;
          }, 1000);
        }
      }

      // 关闭搜索提示页面
      $scope.closeQueryResult = function () {
        vm.showQueryResult = false;
        $scope.resultShow = true;
        $rootScope.$broadcast('user:update', {refreshCardBag: true});
      }

      // 模糊查询
      $scope.onQuery = function (queryString) {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        vm.showQueryResult = false;
        closeQueryResult = true;
        $scope.resultShow = true;

        $scope.pagination.items = getCardListByWord(queryString);
        $scope.pagination.pageIndex = 0;
        $scope.pagination.canLoaded = false;
        $scope.$broadcast('auth:positionChanged', Geolocation.getPosition());
        if ($scope.pagination.items == 0) {
          vm.rs = true;
        }
        $timeout(function () {
          closeQueryResult = false;
        }, 1000);
      }

      // 推荐查询
      $scope.selectSuggestItem = function (suggest) {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        //$ionicScrollDelegate.$getByHandle('homeScroll').resize();
        vm.queryString = suggest.name;
        $timeout(function () {
          $scope.closeQueryResult();
        })
        vm.showQueryResult = false;
        $scope.searchShow = false;
        $scope.resultShow = true;
        closeQueryResult = true;
        //如果搜索名和以前相同，将搜索名提前
        $scope.$on('clearHistory',function(){
          $localStorage.list.length = 0;
          vm.arr = [];
        });
        for (var i = 0; i < vm.arr.length; i++) {
          if (suggest.name == vm.arr[i].name) {
            vm.arr.splice(i, 1);
            break;
          }
        }
        vm.arr.unshift(suggest);
        $scope.arr = vm.arr;
        $localStorage.list = $scope.arr;
        //searchHistoryCache.put('SearchHistory', list);

        $scope.pagination.items = getCardListByKeyWord(suggest);
        $scope.pagination.pageIndex = 0;
        $scope.pagination.canLoaded = false;
        $scope.$broadcast('auth:positionChanged', Geolocation.getPosition());

        $timeout(function () {
          closeQueryResult = false;
        }, 1000);
      }

      $scope.selectSuggestItem1 = function (queryString) {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        vm.showQueryResult = false;
        closeQueryResult = true;
        $scope.resultShow = true;
        vm.queryString = queryString;

        $scope.pagination.items = getCardListByWord(queryString);
        $scope.pagination.pageIndex = 0;
        $scope.pagination.canLoaded = false;
        $scope.$broadcast('auth:positionChanged', Geolocation.getPosition());
        $timeout(function () {
          $scope.closeQueryResult();
        })
        if ($scope.pagination.items == 0) {
          vm.rs = true;
        }
        else
        {
          vm.results = getSuggestCardNameList(queryString, 8);
          $scope.length = vm.results.length;
          var suggest=vm.results[0];
          closeQueryResult = true;
          $scope.$on('clearHistory',function(){
            $localStorage.list.length = 0;
            vm.arr = [];
          });
          //如果搜索名和以前相同，将搜索名提前
          if(vm.arr.length>0)
          {
            for (var i = 0; i < vm.arr.length; i++) {
              if (suggest.name == vm.arr[i].name) {
                vm.arr.splice(i, 1);
                break;
              }
            }
          }
          vm.arr.unshift(suggest);
          $scope.arr = vm.arr;
          $localStorage.list = $scope.arr;
          //searchHistoryCache.put('SearchHistory', list);

          $scope.pagination.items = getCardListByKeyWord(suggest);
          $scope.pagination.pageIndex = 0;
          $scope.pagination.canLoaded = false;
          $scope.$broadcast('auth:positionChanged', Geolocation.getPosition());
        }
        $timeout(function () {
          closeQueryResult = false;
        }, 1000);
      }

      //根据关键数组搜索
      function getCardListByKeyWord(keyWord) {
        var allPublicCards = $scope.publicCards;
        var getByChineseNameList = [];
        var getByDescriptionList = [];
        var getByPinYinList = [];
        var getByEnglishNameList = [];
        var resultList = [];
        for (var i = 0; i < allPublicCards.length; i++) {
          if (allPublicCards[i].PName.CN.indexOf(keyWord.name) >= 0) {
            getByChineseNameList[getByChineseNameList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].Description.indexOf(keyWord.name) >= 0) {
            getByDescriptionList[getByDescriptionList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].PName.PY.indexOf(keyWord.name) >= 0) {
            getByPinYinList[getByPinYinList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].PName.EN.indexOf(keyWord.name) >= 0) {
            getByEnglishNameList[getByEnglishNameList.length] = allPublicCards[i];
            continue;
          }
        }
        resultList = getByChineseNameList.concat(getByDescriptionList).concat(getByPinYinList).concat(getByEnglishNameList);
        return resultList;
      }

      //根据关键词搜索
      function getCardListByWord(keyWord) {
        var allPublicCards = $scope.publicCards;
        var getByChineseNameList = [];
        var getByDescriptionList = [];
        var getByPinYinList = [];
        var getByEnglishNameList = [];
        var resultList = [];
        for (var i = 0; i < allPublicCards.length; i++) {
          if (allPublicCards[i].PName.CN.indexOf(keyWord) >= 0) {
            getByChineseNameList[getByChineseNameList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].Description.indexOf(keyWord) >= 0) {
            getByDescriptionList[getByDescriptionList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].PName.PY.indexOf(keyWord) >= 0) {
            getByPinYinList[getByPinYinList.length] = allPublicCards[i];
            continue;
          }
          if (allPublicCards[i].PName.EN.indexOf(keyWord) >= 0) {
            getByEnglishNameList[getByEnglishNameList.length] = allPublicCards[i];
            continue;
          }
        }
        resultList = getByChineseNameList.concat(getByDescriptionList).concat(getByPinYinList).concat(getByEnglishNameList);
        return resultList;
      }


      //根据关键字搜索,返回前n条记录的中文名
      function getSuggestCardNameList(keyWord, length) {
        var resultList = [];
        var cardList = getCardListByWord(keyWord);
        var cardListLength = cardList.length;
        var count = length > cardListLength ? cardListLength : length;
        for (var i = 0; i < count; i++) {
          var obj = {
            name: '',
            distance: 0
          };
          obj.name = cardList[i].PName.CN;
          obj.distance = cardList[i].distance;
          resultList.push(obj);
        }
        return resultList;
      }

      //热门
      function getHot(){
        Card.getHotSearch().then(function (data) {
          $scope.hotSearch = data;
        }, function (err) {
          Toast.show(err);
        }).finally(function () {
        });
      }

      $scope.myGoBack = function () {
        $ionicHistory.goBack();
      };

      if (!$scope.arr) {
        $scope.historyShow = true;
      }

      //清除搜索记录
      $scope.clearHistory = function () {
        $localStorage.list = [];
        $scope.arr =[];
        $scope.historyShow = true;
        $scope.$broadcast('clearHistory');
      }
    })

    .filter('highlight', function ($sce) {
      return function (text, phrase) {
        if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
          '<span class="highlighted">$1&nbsp;</span>');
        return $sce.trustAsHtml(text)
      }
    })
}());

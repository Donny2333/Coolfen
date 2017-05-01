/**
 * Created by Donny on 2015/10/8.
 */
(function () {
    "use strict";

    angular.module('CoolfenMobileApp.controllers')

        .controller('addCardCtrl', function ($rootScope, $scope, $ionicLoading, $ionicScrollDelegate, $filter, $timeout, Geolocation, Auth, Card, URL_CFG, Toast, $ionicHistory) {
            var vm = $scope.vm = {};
            vm.sort = 'distance';
            vm.results = [];
            $scope.isExist=false;
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

            $scope.$on('auth:login', function () {
                updateCards();
                getPublicCards();
            });

            $scope.$on('auth:logout', function () {
                updateCards();
                getPublicCards();
            });

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

            // 新增用户卡
            $scope.addNearCard = function (card) {
              $ionicHistory.goBack(-2);
              $scope.addUserCard(card);
            }
            $scope.addUserCard = function (card) {
                if (card.isAdded) {
                    //Card.setCurCardId(card.PID);
                    var userCards = Card.getUserCardsOnlyFromCache();
                    for(var i=0;i<userCards.length;i++){
                        var userCard = userCards[i];
                        if(userCard.PublicCardOutputSimplify.PID == card.PID){
                            Card.setCurCardId(userCard.UserCardID);
                            break;
                        }
                    }
                    $rootScope.$broadcast('home.SwipeToCard');
                    $scope.$parent.info.showAddCardPage = false;
                    $ionicScrollDelegate.$getByHandle('homeScroll').scrollTop();
                    $ionicScrollDelegate.$getByHandle('homeScroll').resize();
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
                    Auth.setAddedNewCard(true);
                    //Card.setCurCardId(data.PublicCardID);
                    Card.setCurUserCard(data);
                    //$rootScope.$broadcast('cards:addUserCard');
                    $rootScope.$broadcast('user:update', {refreshCardBag: true});
                    $rootScope.$broadcast('cards:addUserCard2', {PID: data.PublicCardOutputSimplify.PID});
                    Auth.setPoint(Number(Auth.getMe().BalancePoints) + data.Points);
                    //Toast.show('新增用户卡成功');
                }, function (err) {
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
                vm.loading = true;
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
                    }
                ).finally(function () {
                        vm.loading = false;
                    })
            }

            // 填充发现卡列表
            function populateFindCardList(publicCards) {
                var comparedCards;
                vm.loading = true;
                //每次都要求用新请求到的get all usercard做比较
                Card.getUserCards(true).then(function (newUserCardData) {
                    comparedCards = newUserCardData;
                    AddTagFromMatchedCard1(publicCards, comparedCards);

                    firstPaged(publicCards, true);    // 首次分页
                })
                    .finally(function () {
                        $ionicLoading.hide();
                        vm.loading = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
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
                        Card.setPublicCard(publicCards[index]);
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
        })


})();


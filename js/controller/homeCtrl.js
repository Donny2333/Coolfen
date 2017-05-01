/**
 * Created by SF002 on 2015/9/23.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('homeCtrl', ["$scope", "$rootScope", "$state", "$ionicLoading", "$timeout", "$filter", "$ionicScrollDelegate", "$ionicPopup", "$log", "Geolocation", "Auth", "Card", "Toast", "URL_CFG", '$localStorage', 'Hub', 'ModalService', 'CoolfenCache',
      function ($scope, $rootScope, $state, $ionicLoading, $timeout, $filter, $ionicScrollDelegate, $ionicPopup, $log, Geolocation, Auth, Card, Toast, URL_CFG, $localStorage, Hub, ModalService, CoolfenCache) {
        $scope.vm = {
          current: 0,
          currentUserCard: null,
          isPrepaidCardMerchant: false,
          isUpdate: false,
          bills: []
        };
        $scope.info = {
          ready: true,
          showAddCardPage: false,
          addCardPageHeigh: window.screen.height - 64 - 120 //header's height : 44px, wheelCards's height: 160px
        };
        var cards = [];

        // 3D cards component
        var swiper = new Swiper('.swiper-container', {
          scrollbar: '.swiper-scrollbar',
          scrollbarHide: false,
          spaceBetween: 45,
          effect: 'coverflow',
          grabCursor: true,
          centeredSlides: true,
          coverflow: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1.5,
            slideShadows: true
          },
          //freeMode: true,
          //loop: true,
          slidesPerView: 'auto',
          mousewheelControl: true,
          lazyLoading: true,
          onTransitionStart: function (swiper) {
            $scope.info.ready = false;
          },
          onTransitionEnd: function (swiper) {
            var index = Math.round(swiper.progress * (cards.length - 1));
            var amount = cards.length - 1 <= 0 ? 0 : cards.length - 1;
            if (amount > 0) {
              $scope.vm.current = index;
              Card.setCurCardId(cards[index].UserCardId);
              $scope.$broadcast('home.CardChange', {
                index: index,
                card: cards[index]
              });
              console.log("current : " + index.toString() + " / " + amount.toString());
            }
            $('.swiper-slide').eq(index).addClass('sel').siblings().removeClass('sel');
            $scope.info.ready = true;
          }
        });

        // 清除当前卡的卡ID
        Card.removeCurCardId();

        $scope.$on("$ionicView.beforeEnter", function (event, args) {
          if ($scope.vm.isUpdate) {
            $scope.vm.isUpdate = false;
            Card.setCurCardId(cards[$scope.vm.current].UserCardID);
            init();
            $scope.$broadcast('home.SwipeToCard');
          }
        });

        $rootScope.$on('user:update', function (event, args) {
          if (args.refreshCardBag) {
            $scope.vm.isUpdate = true;
          }
        });

        $rootScope.$on('Auth:login', function (event, args) {
          console.log('homeCtrl : init');
          var hub = initHub();
          hub.disconnect();
          hub.connect();
          if (Auth.getMe().loggedIn) {
            // 前端切换为“用户身份”时，登录刷新卡包
            init();
            // console.log('4-0 : homeCtrl');
            $log.log('4-0 : homeCtrl');
          } else {
            // 前端切换为游客身份时，为确保后端不是“陌生人身份”，发送请求通知后端转换为“游客身份”，再刷新卡包
            Auth.CheckIsMobileLogin().then(function (data) {
              console.log('4-1 : homeCtrl');
            }, function (err) {
              console.log('4-2 : homeCtrl');
            }).finally(function () {
              init();
            });
          }
        });

        $rootScope.$on('cards:addUserCard', function (event, args) {
          console.log('cards:addUserCard');
          // 当用户是在“新手指引”状态时移动卡包，则显示第四张“新手指引”页面
          if ($localStorage.guideContinue) {
            $localStorage.guideContinue = false;
            $timeout(function () {
              $rootScope.$broadcast('refreshGuideData', {
                guide4: false
              });
            }, 500);
          }

          if ($scope.vm.isUpdate) {
            init();
            $scope.vm.isUpdate = false;
          }

          $scope.$parent.info.showAddCardPage = false;
          $ionicScrollDelegate.$getByHandle('homeScroll').scrollTop();
          $ionicScrollDelegate.$getByHandle('homeScroll').resize();
        });

        // 来自“搜索”页面的添加卡消息
        $rootScope.$on('cards:addUserCard2', function (event, args) {
          if (!_.isUndefined(args.PID)) {
            //Card.setCurCardId(args.PID);
            //Card.setCurUserCard(args);

            if ($scope.vm.isUpdate) {
              $scope.vm.isUpdate = false;
              $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
                showBackdrop: false
              });

              Card.getUserCards(true).then(function (data) {

                var card = {
                  PublicCardOutputSimplify: {
                    PImage: {
                      bg: 'addCard.png'
                    },
                    PName: {
                      CN: ''
                    }
                  }
                };

                if (data.length > 0) {
                  cards = data;
                  // “加号卡”放置在第一个位置位置
                  cards.unshift(card);
                } else {
                  card.PublicCardOutputSimplify.PName.CN = '卡失效，请重新登录'
                  cards = [];
                  cards.push(card);
                }

                swiper.removeAllSlides();
                cards.forEach(function (card) {
                  swiper.appendSlide('<div class="swiper-slide" style="background-image:url(' + URL_CFG.img +
                  card.PublicCardOutputSimplify.PImage.bg + ')"> \
                  <div class="wheelCardName" ng-if="card.PublicCardOutputSimplify.PName.CN != \'\'">' + card.PublicCardOutputSimplify.PName.CN + '</div> \
                </div> ');
                });
              })
                .finally(function () {
                  $ionicLoading.hide();

                  var id = args.PID;
                  var index = 1;

                  if (!_.isUndefined(id) && !_.isEmpty(id)) {
                    // 获取指定私有卡在卡包中的位置
                    for (var i = 1; i < cards.length; i++) {

                      if (cards[i].PublicCardOutputSimplify.PID == id) {
                        index = i;
                        break;
                      }
                    }
                  }

                  // 移动到第一张卡（非“加号卡”）
                  swiper.slideTo(index, 500, function () {
                  });
                  $scope.vm.current = index;

                  //alert(id);
                  $scope.info.showAddCardPage = false;

                  fillData(cards[$scope.vm.current].UserCardID);
                  getBallInfo(cards[$scope.vm.current]);
                  getUsePointInformation(cards[$scope.vm.current]);

                  $timeout(function () {
                    $ionicScrollDelegate.$getByHandle('homeScroll').scrollTop();
                    $ionicScrollDelegate.$getByHandle('homeScroll').resize();
                  }, 0);
                })
            }
          }
        })

        // 响应卡片翻转后的消息事件
        $scope.$on('home.CardChange', function (event, args) {
          // 当用户是在“新手指引”状态时移动卡包，则显示第四张“新手指引”页面
          if ($localStorage.guideContinue) {
            $localStorage.guideContinue = false;
            $timeout(function () {
              $rootScope.$broadcast('refreshGuideData', {
                guide4: false
              });
            }, 500);
          }

          // 如果是第一张，即“加号卡”，则打开添加卡列表
          if (args.index == 0) {
            $timeout(function () {
              $scope.info.showAddCardPage = true;
            }, 0);
          } else {
            $timeout(function () {
              $scope.info.showAddCardPage = false;
            }, 0);

            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('homeScroll').scrollTop();
              $ionicScrollDelegate.$getByHandle('homeScroll').resize();
            }, 0);

            getBallInfo(cards[args.index]);
            fillData(cards[args.index].UserCardID);
            getUsePointInformation(cards[args.index]);
          }
        });

        // 根据私有卡对应公共卡ID，翻转卡包到指定私有卡
        $rootScope.$on('home.SwipeToCard', function (event, args) {
          // 当用户是在“新手指引”状态时移动卡包，则显示第四张“新手指引”页面
          if ($localStorage.guideContinue) {
            $localStorage.guideContinue = false;
            $timeout(function () {
              $rootScope.$broadcast('refreshGuideData', {
                guide4: false
              });
            }, 500);
          }

          //var id = Card.getCurCardId();
          var id = Card.getCurrentPublicCardId();
          var index = 1;

          if (!_.isUndefined(id) && !_.isEmpty(id)) {
            // 获取指定私有卡在卡包中的位置
            for (var i = 1; i < cards.length; i++) {
              if (cards[i].PublicCardOutputSimplify.PID == id) {
                index = i;
                break;
              }
            }

            // 清除当前卡的公卡ID
            Card.removeCurCardId();

            // 移动到第一张卡（非“加号卡”）
            swiper.slideTo(index, 1000, function () {
            });

            $scope.vm.current = index;
            Card.setCurCardId(cards[index].UserCardId);
            $scope.$broadcast('home.CardChange', {
              index: index
            });
          }
        });

        $rootScope.$on('home.SwipeToCard2', function (event, args) {
          // 翻转到“加号卡”
          if (args.id == 0) {
            swiper.slideTo(0, 1000, function () {
            });
            $scope.vm.current = 0;
            $timeout(function () {
              $scope.info.showAddCardPage = true;
            }, 0);
          } else {

            var index = 1;

            // 获取指定私有卡在卡包中的位置
            for (var i = 1; i < cards.length; i++) {
              if (cards[i].PublicCardOutputSimplify.PID == args.card.PID) {
                index = i;
                break;
              }
            }

            //如果卡包没有这张卡，则转到现有卡包中的第一张卡
            swiper.slideTo(index, 1000, function () {
            });
            $scope.vm.current = index;
            Card.setCurCardId(cards[index].UserCardId);
            $scope.$broadcast('home.CardChange', {
              index: index
            });
          }
        })

        $rootScope.$on('Card.Pay', function (event, args) {
          var card = args.card;
          $scope.vm.currentUserCard = args.card;
          $scope.vm.CurrentPoints = $scope.vm.currentUserCard.Points;
        });

        function init() {

          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
            showBackdrop: false
          });

          Card.getUserCards().then(function (data) {

            var card = {
              PublicCardOutputSimplify: {
                PImage: {
                  bg: 'addCard.png'
                },
                PName: {
                  CN: ''
                }
              }
            };

            if (data.length > 0) {
              cards = data;
              // “加号卡”放置在第一个位置位置
              cards.unshift(card);
            } else {
              card.PublicCardOutputSimplify.PName.CN = '卡失效，请重新登录'
              cards = [];
              cards.push(card);
            }

            swiper.removeAllSlides();
            cards.forEach(function (card) {
              swiper.appendSlide('<div class="swiper-slide" style="background-image:url(' + URL_CFG.img +
              card.PublicCardOutputSimplify.PImage.bg + ')"> \
                  <div class="wheelCardName" >' + card.PublicCardOutputSimplify.PName.CN + '</div> \
                </div> ');
            });
          })
            .finally(function () {
              $ionicLoading.hide();

              //var id = Card.getCurCardId();
              var id = Card.getCurrentPublicCardId();
              var index = 1;

              if (!_.isUndefined(id) && !_.isEmpty(id)) {
                // 获取指定私有卡在卡包中的位置
                for (var i = 1; i < cards.length; i++) {

                  if (cards[i].PublicCardOutputSimplify.PID == id) {
                    index = i;
                    break;
                  }
                }

                // 清除当前卡的公卡ID
                //Card.removeCurCardId();

              }

              // 移动到第一张卡（非“加号卡”）
              swiper.slideTo(index, 500, function () {
              });
              $scope.vm.current = index;

              //alert(id);
              $scope.info.showAddCardPage = false;

              fillData(cards[$scope.vm.current].UserCardID);
              getBallInfo(cards[$scope.vm.current]);
              getUsePointInformation(cards[$scope.vm.current]);

              $timeout(function () {
                $ionicScrollDelegate.$getByHandle('homeScroll').scrollTop();
                $ionicScrollDelegate.$getByHandle('homeScroll').resize();
              }, 0);
            })
        }

        // 获取水球信息
        function getBallInfo(card) {
        	$scope.disabled = false;
          var json = {
            UserCardID: card.UserCardID
          }

          Card.getBallInfo(json, function (data) {
            if (data.ErrorCode == 0) {
              // vm.info.value = data.Value;
              $scope.vm.CurrentPoints = data.Value.CurrentPoints;
              // $scope.vm.Percent = data.Value.Percent / 100;
              $scope.vm.MaxCapacity = data.Value.MaxCapacity;
              $scope.vm.getPoints = data.Value.SingleTimeEffort;
              // $scope.vm.vmCurrentPoints = data.Value.CurrentPoints;
              //$scope.vm.getPoints = 5;
              // $.rotate({
              //     value: $scope.vm.Percent,
              //     time: 2,
              //     start: 0,
              //     y: -12
              // });
              // $scope.vm.vmPercent = data.Value.Percent / 100;
              //console.log('1 :' + $scope.vm.vmPercent);
              // $('#lines').prop('number', "0").stop(true, true);
              // $('#lines').prop('number', "0").animateNumber({
              //     number: $scope.vm.CurrentPoints
              // }, 2000);
            }
          }, function (err) {
            $log.log('与服务器连接失败');
          })
        }

        //获取积分规则
        function getUsePointInformation(card) {
          var json = {
            UserCardID: card.UserCardID
          }
          Card.getUsePointInformation(json, function (data) {
            if (data.ErrorCode == 0) {
              if (data.ShortDescription != null) {
                $scope.vm.ShortDescription = data.ShortDescription.replace(/\[/g, "<b>").replace(/\]/g, "</b>");
                document.getElementById("ShortDescription").innerHTML = $scope.vm.ShortDescription;
                $scope.vm.RedeemRules = data.RedeemRules;
              } else {
                $scope.vm.ShortDescription = "";
                $scope.vm.RedeemRules = "";
                document.getElementById("ShortDescription").innerHTML = $scope.vm.ShortDescription;
                document.getElementById("RedeemRules").innerHTML = $scope.vm.RedeemRules;
              }
            }
          }, function (err) {
            Toast.show(err);
          })
        }

        // 吸分
        var flag = true;

        $scope.get = function () {
          if (!flag) {
            return;
          }
          flag = false;
          $scope.loggedIn = Auth.getMe().loggedIn;
          var json = {
            ToUserCardID: cards[$scope.vm.current].UserCardID,
            TargetGetPoints: $scope.vm.getPoints,
            CurrentPoints: $scope.vm.CurrentPoints,
            MaxCapacity: $scope.vm.MaxCapacity
          };

          Card.getExtractPoints(json, function (data) {

            if (data.ErrorCode == 0) {
              // $scope.vm.Percent = data.Value.Percent / 100;
              $scope.vm.CurrentPoints = data.Value.CurrentPoints;
              //console.log('2 : ' + $scope.vm.vmPercent);
              // $.rotate({
              //     value: $scope.vm.Percent,
              //     time: 3,
              //     start: $scope.vm.vmPercent,
              //     y: -30 - 210 * $scope.vm.vmPercent
              // });
              // $scope.vm.vmPercent = data.Value.Percent / 100;

              // $('#lines').prop('number', $scope.vm.vmCurrentPoints).stop(true, true);
              // $('#lines').prop('number', $scope.vm.vmCurrentPoints).animateNumber({
              //     number: $scope.vm.CurrentPoints
              // }, 2000);
              // $scope.vm.vmCurrentPoints = data.Value.CurrentPoints;

              var currentUserCard = Card.getUserCardByIdOnlyFromCache(json.ToUserCardID);
              currentUserCard.Points = data.Value.CurrentPoints;
              Card.setUserCard(currentUserCard);

              for (var i = 0; i < data.Value.Details.length; i++) {
                var extractedInfo = data.Value.Details[i];
                var userCardId = extractedInfo.UserCardID;
                var point = extractedInfo.Points;
                var card = Card.getUserCardByIdOnlyFromCache(userCardId);
                card.Points = point;
                Card.setUserCard(card);
              }
            } else {
              Toast.show(data.ErrorMessages);
            }
          }, function (err) {
            Toast.show("与服务器连接失败");
          })
            .finally(function () {
              $timeout(function () {
                flag = true;
              }, 3000)
            });
        };

        $scope.onPay = function () {
          if ($scope.info.ready) {
            $state.go('app.cardPay');
          }
        };

        // 查看商铺位置
        $scope.onPosition = function (address) {
          Card.setPosition(address);
          $state.go('app.card-position', {
            id: $scope.vm.currentUserCard.PublicCardOutputSimplify.PID
          });
        };

        // 填充usercard信息
        function fillData(userCardId) {
          Card.getUserCardInfo(userCardId).then(function (data) {
            $scope.vm.currentUserCard = data;
            Card.setCurUserCard(data);
            //判断是否为储值卡
            $scope.vm.isPrepaidCardMerchant = data.PublicCardOutputSimplify.IsPrepaidCard;
          });
          // 获取账单信息
          Card.getBills(userCardId).then(function (data) {
            $scope.vm.bills = data;
          });

        }

        $scope.deleteCard = function () {
          var confirmPopup = $ionicPopup.confirm({
            cssClass: 'logout-body',
            template: '<div class=\"logout-title text-center \">小主，你忍心抛弃此卡么？</div>',
            okText: '残忍抛弃',
            cancelText: '再想想',
            cancelType: 'button-light',
            okType: 'button-coolfen'
          });

          confirmPopup.then(function (res) {
            if (res) {
              // 点击OK则删除卡片
              Card.suspendUserCard($scope.vm.currentUserCard.UserCardID, function (data) {
                if (data.ErrorCode == 0) {
                  CoolfenCache.removeUserCardById($scope.vm.currentUserCard.UserCardID);
                  init();
                  Auth.setPoint(Number(Auth.getMe().BalancePoints) - $scope.vm.currentUserCard.Points);
                  $rootScope.$broadcast('user:update', {
                    refreshCardBag: true
                  });
                  $timeout(function () {
                    Toast.show(data.Value);
                  }, 1500);
                  $scope.modal.hide();
                } else {
                  Toast.show(data.ErrorMessages[0]);
                }
              }, function (err) {
                Toast.show('与服务器连接失败：' + angular.toJson(err));
              });
            }
          })
        };

        $scope.clickTradingRecord = function () {
          ModalService
            .init('trading.html', $scope)
            .then(function (modal) {
              modal.show();
            });
        }

        $scope.clickActivity = function () {
          ModalService
            .init('activity.html', $scope)
            .then(function (modal) {
              modal.show();
            });
        }

        $scope.clickLocation = function (address) {
          Card.setPosition(address);
          $state.go('app.card-position', {id: $scope.vm.currentUserCard.PublicCardOutputSimplify.PID});
        }

        function initHub() {
          var hub = new Hub('messageHub', {
            rootPath: URL_CFG.hub,

            //logging: true,
            logging: false,

            listeners: {
              'hello': function (msg) {
                Toast.showStick(msg);
              },
              'send': function (msg) {
                $scope.$apply(function () {
                  Toast.showStick(msg);
                });
                $('.ionic_toast').find('span:last').click(function () {
                  $state.go('app.messageList');
                  $rootScope.$broadcast('home.enterMessageCenter');
                  $scope.$apply(function () {
                    Toast.hide();
                  });
                });
              }
            },

            methods: ['hello', 'send'],

            errorHandler: function (error) {
              console.error(error);
            }

          });
          return hub;
        }

        initHub();
        var element = '<a href="#" ng-click="search()" style="width: 100%;background: rgba(255,255,255,0.7);padding: 5px 27%;border-radius:20px;text-decoration:none;color: #474f59;font-size: 14px; "><i class="iconfont">&#xe617;</i>&nbsp;&nbsp;&nbsp;&nbsp;搜索全部卡片</a>';
        $scope.pageTitle = element;
      }
    ])

    .filter('tradeDate', function () {
      return function (lastPhotoTime) { // lastPhotoTime 必须格式yyyy-MM-dd hh:mm:ss
        var beforeTime = Date.parse(lastPhotoTime);
        var nowTime = new Date().getTime(); //1970毫秒
        var timeDifference = Math.abs(nowTime - beforeTime) / 1000; //差取绝对值
        var time;
        if (timeDifference / 3600 < 1) {
          time = lastPhotoTime.substring(11, 16)
        } else { //yyyy年M月dd日
          var year = lastPhotoTime.substring(2, 4);
          var mouth = lastPhotoTime.substring(5, 7);
          if (mouth < 10) mouth = mouth.replace('0', '');
          var day = lastPhotoTime.substring(8, 10);
          time = year + '/' + mouth + '/' + day;
        }
        return time;
      }
    })
}());

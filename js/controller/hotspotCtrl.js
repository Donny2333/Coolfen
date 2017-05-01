/**
 * Created by SF002 on 2015/10/12.
 */

(function () {
    "use strict";

    angular.module('CoolfenMobileApp.controllers')
        .controller('hotspotCtrl', ['$scope', '$cordovaInAppBrowser', '$rootScope', '$timeout', '$state', '$ionicLoading', '$ionicSlideBoxDelegate', 'Merchant', 'URL_CFG', 'Auth', 'Card', 'user', 'Toast','$ionicScrollDelegate',
            function ($scope, $cordovaInAppBrowser, $rootScope, $timeout, $state, $ionicLoading, $ionicSlideBoxDelegate, Merchant, URL_CFG, Auth, Card, user, Toast, $ionicScrollDelegate) {
                $scope.items = {};
                $scope.information=[];
                $scope.information_li=null;
                $scope.url = URL_CFG.img;

                loadNewMerchant();  // 加载最新的商户

                $scope.goHome = function () {
                    user.goHome();
                }

                $scope.addCard = function () {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="ios"></ion-spinner><br> 添加中... ',
                        showBackdrop: true
                    });

                    var index = $ionicSlideBoxDelegate.currentIndex();
                    $scope.info = $scope.items[index];
                    var card = {PID: $scope.info.PublicCardID};
                    console.log(card);

                    Card.addUserCard(card).then(function (data) {
                        Auth.setAddedNewCard(true);
                        //Card.setCurCardId($scope.info.PublicCardID);
                        Card.setCurUserCard(data);
                        //Toast.show('添加卡片成功！');
                        user.goHome(true);
                        //$rootScope.$broadcast('cards:addUserCard');
                        $rootScope.$broadcast('user:update', {refreshCardBag: true});
                        $rootScope.$broadcast('cards:addUserCard2', {PID: data.PublicCardOutputSimplify.PID});
                    }, function (err) {
                        Toast.show(err);
                    })
                        .finally(function () {
                            $ionicLoading.hide();
                        });

                }
                //dot
                $scope.slideHasChanged = function (index) {
                    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                    $scope.slideIndex = index;
                    $(".dot").find("ul li").removeClass("sel");
                    $(".dot").find("ul li").eq($scope.slideIndex).addClass("sel");
                };

                // 加载最新的商户
                function loadNewMerchant() {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
                        showBackdrop: true
                    });

                    Merchant.getNewMerchant().then(function (data) {
                        if (data.length > 5) {
                            $scope.items = data.slice(0, 5);
                        } else {
                            $scope.items = data;
                            console.log($scope.items);//只有5个对象
                        }
                        for(var i=0;i<$scope.items.length;i++){
//								$scope.information=$scope.items[i].CardActivityRules.split('<br>');
							     $scope.items[i].CardActivityRules="<i class='sanjiao_right'></i>"+$scope.items[i].CardActivityRules.replace(/<br>/g,"<br><br><i class='sanjiao_right'></i>");
                            }

                        $ionicSlideBoxDelegate.update();
                    })
                        .finally(function () {
                            $ionicLoading.hide();
                        });
                }

            }])
})();
/*
function setHeight(){

  document.getElementsByClassName("scroll").style.height=240+"px";
}
*/

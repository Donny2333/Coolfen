/**
 * Created by feng on 2015/9/25.
 */
(function () {
    "use strict";

    angular.module('CoolfenMobileApp.controllers')

        .controller('CardPositionCtrl', ['$scope', '$rootScope', '$timeout', '$ionicLoading','Card',
            function ($scope, $rootScope, $timeout, $ionicLoading,Card) {

                //$scope.position = {
                //    GeoCoordination:{
                //        Longitude:114.323904,
                //        Latitude:30.535491
                //    }
                //};
                $scope.position = Card.getPosition();
                $scope.pos = {
                    lng: $scope.position.GeoCoordination.Longitude,
                    lat: $scope.position.GeoCoordination.Latitude
                };

                var map;

                initBMap();

                // 初始化百度地图
                function initBMap() {
                    //$ionicLoading.show({
                    //    template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
                    //    showBackdrop: true
                    //});

                    $timeout(function () {
                        createMap();             //  创建地图
                        //addMapControl();         //  向地图添加控件
                    });
                }

                //  创建地图
                function createMap() {
                    map = new BMap.Map("allmap");         // 创建Map实例
                    var point = new BMap.Point($scope.pos.lng, $scope.pos.lat);   // 创建点坐标
                    map.centerAndZoom(point, 15);               // 初始化地图,设置中心点坐标和地图级别
                    map.addControl(new BMap.ZoomControl());      //添加地图缩放控件
                    map.addControl(new BMap.ScaleControl());    // 添加比例尺控件

                    markerPoint(point);                    //  标注点

                    // 地图加载完毕
                    //map.addEventListener("tilesloaded", function () {
                    //    $ionicLoading.hide();
                    //});
                }

                // 标注点
                function markerPoint(point) {
                    var marker = new BMap.Marker(point);
                    // 清除所有的标注点
                    map.clearOverlays();
                    map.addOverlay(marker);

                    var opts = {
                        width: 150,     // 信息窗口宽度
                        height: 50,     // 信息窗口高度
                        title: "商户地址", // 信息窗口标题
                        enableMessage: false,//设置允许信息窗发送短息
                    };

                    var address = $scope.position.District + $scope.position.Street + $scope.position.Details;

                    //创建信息窗口
                    var infoWindow = new BMap.InfoWindow("地址：" + address);

                    map.addOverlay(marker);                 // 将标注添加到地图中

                    marker.openInfoWindow(infoWindow);
                    marker.addEventListener("click", function () {
                        this.openInfoWindow(infoWindow);
                    });
                }

                //  向地图添加控件
                function addMapControl() {
                    var bottom_right_navigation = new BMap.NavigationControl({
                        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                        type: BMAP_NAVIGATION_CONTROL_ZOOM
                    }); //右下角，仅包含平移和缩放按钮

                    map.addControl(bottom_right_navigation);
                }
            }]);
})();

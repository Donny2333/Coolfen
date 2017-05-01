/**
 * Created by Administrator on 2015/10/11.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('CoolFriendCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'Auth', 'Card', 'Toast', 'URL_CFG', 'user',
      function ($rootScope, $scope, $ionicModal, $ionicLoading, Auth, Card, Toast, URL_CFG, user) {
        $scope.info = {};

        $scope.goHome = function () {
          user.goHome();
        }

        var i = 0;

        //$scope.MessageCache = [
        //    {
        //        MobilePhoneNum: "13812345601",
        //        PublicCardName: "街道口秀玉",
        //        PublicCardUserNum: 101,
        //        BusinessArea: '街道口',
        //        color: '#FF00FF'
        //    },
        //    {
        //        MobilePhoneNum: "13812345602",
        //        PublicCardName: "徐东雅和睿景花园酒店",
        //        PublicCardUserNum: 102,
        //        BusinessArea: '徐东',
        //        color: '#FF00FF'
        //    },
        //    {
        //        MobilePhoneNum: "13812345603",
        //        PublicCardName: "光谷拿渡体验店",
        //        PublicCardUserNum: 103,
        //        BusinessArea: '光谷',
        //        color: '#FF0000'
        //    },
        //    {
        //        MobilePhoneNum: "13812345604",
        //        PublicCardName: "楚河汉街秀玉",
        //        PublicCardUserNum: 104,
        //        BusinessArea: '楚河汉街',
        //        color: '#FF00FF'
        //    },
        //    {
        //        MobilePhoneNum: "13812345605",
        //        PublicCardName: "钟家村拿渡",
        //        PublicCardUserNum: 105,
        //        BusinessArea: '钟家村',
        //        color: '#FF0000'
        //    },
        //    {
        //        MobilePhoneNum: "13812345606",
        //        PublicCardName: "武广雅和睿景花园酒店",
        //        PublicCardUserNum: 106,
        //        BusinessArea: '武广',
        //        color: '#00FFFF'
        //    },
        //    {
        //        MobilePhoneNum: "13812345607",
        //        PublicCardName: "中南秀玉",
        //        PublicCardUserNum: 107,
        //        BusinessArea: '中南',
        //        color: '#FF00FF'
        //    },
        //    {
        //        MobilePhoneNum: "13812345608",
        //        PublicCardName: "王家湾雅和睿景花园酒店",
        //        PublicCardUserNum: 108,
        //        BusinessArea: '王家湾',
        //        color: '#FFFF00'
        //    },
        //    {
        //        MobilePhoneNum: "13812345609",
        //        PublicCardName: "江汉路拿渡",
        //        PublicCardUserNum: 109,
        //        BusinessArea: '江汉路',
        //        color: '#FFFF00'
        //    }
        //];
        $scope.items = [];

        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        var x = -100;         //x-ray
        var y = -100;         //y-ray
        var r = 20;         //半径
        var rDelta = 2;     //半径增量
        var color = '#FF00FF';

        init();

        var canvasHeight;       //图片高度
        var canvasWidth;        //图片宽度

        function init() {
          $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br> 加载中... ',
            showBackdrop: true
          });

          Card.getCoolfenFriends().then(function (data) {
            if (data == '' || data == null) {
              return;
            }
            $scope.MessageCache = data;
          })
            .finally(function () {
              $ionicLoading.hide();
              drawCanvas();
              setInterval(showMessage, 3000);
              setInterval(drawCanvas, 50);

              var bg = document.getElementById("bg");

              canvasWidth = bg.offsetWidth;
              canvasHeight = canvasWidth / 16 * 9;
            });
        }

        function showMessage() {
          getMessage();
        }

        var drawNum = 2;

        function getMessage() {
          if ($scope.items.length >= 7) {
            $scope.items.pop();
          }
          $scope.items.splice(0, 0, $scope.MessageCache[( i + 1 ) % $scope.MessageCache.length]);

          context.clearRect(0, 0, canvas.width, canvas.height);
          i = ( i + 1 ) % $scope.MessageCache.length;
          $scope.$apply();

          switch ($scope.MessageCache[i].BusinessArea) {
            case '光谷':
              x = 329 / 375 * canvasWidth;
              y = 158 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '楚河汉街':
              x = 234 / 375 * canvasWidth;
              y = 98 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '街道口':
              x = 293 / 375 * canvasWidth;
              y = 153 / 375 * canvasWidth;
              color = '#FF00FF';

              break;

            case '中南':
              x = 254 / 375 * canvasWidth;
              y = 143 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '徐东':
              x = 258 / 375 * canvasWidth;
              y = 55 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '武汉天地':
              x = 228 / 375 * canvasWidth;
              y = 18 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '江汉路':
              x = 203 / 375 * canvasWidth;
              y = 48 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '菱角湖':
              x = 166 / 375 * canvasWidth;
              y = 19 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '武广':
              x = 160 / 375 * canvasWidth;
              y = 66 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '钟家村':
              x = 145 / 375 * canvasWidth;
              y = 107 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

            case '王家湾':
              x = 89 / 375 * canvasWidth;
              y = 76 / 375 * canvasWidth;
              color = '#FF00FF';
              break;

          }

          drawNum = 2;
        }

        function drawCanvas() {
          if (drawNum <= 0) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            return;
          }

          context.clearRect(0, 0, canvas.width, canvas.height);

          r += rDelta;
          if (r >= 40) {
            r = 10;
            drawNum--;
          }

          drawCircle(x, y, r, color);
        }

        function drawCircle(x, y, r, color) {
          context.strokeStyle = color;
          context.fillStyle = color;
          context.beginPath();
          context.arc(x, y, r, 0, Math.PI * 2, true); //Math.PI*2是JS计算方法，是圆
          context.closePath();
          context.stroke();
          //context.fill();
        }

      }])
})();

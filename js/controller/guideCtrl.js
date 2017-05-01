/**
 * Created by SF002 on 2015/10/26.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')
    .controller('guideCtrl', function ($scope, $rootScope, $localStorage, $timeout, Card) {

      // readable为false或者null，表示“没进入过新手引导页”，需要显示新手引导页
      $scope.guide = [
        {
          img: 'guide0.png',
          readable: false
        },
        {
          img: 'guide1.jpg',
          readable: false
        },
        {
          img: 'guide2.jpg',
          readable: false
        },
        {
          img: 'guide3.jpg',
          readable: false
        }, {
          img: 'guide4.jpg',
          readable: false
        }
      ];

      // 默认不显示新手引导页
      $scope.guide[0].readable = $localStorage.guide0 ? $localStorage.guide0 : $localStorage.guide0 = true;
      $scope.guide[1].readable = $localStorage.guide1 ? $localStorage.guide1 : $localStorage.guide1 = true;
      $scope.guide[2].readable = $localStorage.guide2 ? $localStorage.guide2 : $localStorage.guide2 = true;
      $scope.guide[3].readable = $localStorage.guide3 ? $localStorage.guide3 : $localStorage.guide3 = true;
      $scope.guide[4].readable = $localStorage.guide4 ? $localStorage.guide4 : $localStorage.guide4 = true;

      $localStorage.guideContinue = false;

      $rootScope.$on('refreshGuideData', function (event, args) {
        console.log(args);

        if ('guide0' in args) {
          $localStorage.guide0 = args.guide0;

          $timeout(function () {
            $scope.guide[0].readable = $localStorage.guide0;
          }, 0)
        }

        if ('guide1' in args) {
          $localStorage.guide1 = args.guide1;

          $timeout(function () {
            $scope.guide[1].readable = $localStorage.guide1;
          }, 0)
        }

        if ('guide2' in args) {
          $localStorage.guide2 = args.guide2;

          $timeout(function () {
            $scope.guide[2].readable = $localStorage.guide2;
          }, 0)
        }

        if ('guide3' in args) {
          $localStorage.guide3 = args.guide3;

          $timeout(function () {
            $scope.guide[3].readable = $localStorage.guide3;
          }, 0)
        }

        if ('guide4' in args) {
          $localStorage.guide4 = args.guide4;

          $timeout(function () {
            $scope.guide[4].readable = $localStorage.guide4;
          }, 0)
        }
      });

      $scope.readGuide = function (index) {
        $scope.guide[index].readable = true;

        switch (index) {
          case '0':
            //$scope.guide[1].readable = false;
            //break;

          //case '1':
          //  $timeout(function () {
          //    // 翻转到“加号卡”
          //    $rootScope.$broadcast('home.SwipeToCard2', {id: 0});
          //
          //    // 1.2s后显示第二张和第三种新手指引图
          //    $timeout(function () {
          //      $scope.guide[2].readable = false;
          //      $scope.guide[3].readable = false;
          //    }, 800);
          //  }, 1000);
          //  break;
          //
          //case '2':
          //  break;
          //
          //case '3':
          //  $localStorage.guideContinue = true;
          //  break;
          //
          //case '4':
          //  $localStorage.guideContinue = false;
          //  break;

          default:
            break;
        }
      }
    })
})();


/**
 * Created by SF002 on 2015/10/10.
 */
(function () {
  "use strict";
  angular.module('CoolfenMobileApp.controllers')
    .controller('activityCtrl',function($scope,Auth,$cordovaInAppBrowser,$localStorage){
      startGame();
      function startGame(){
          if (Auth.getMe().loggedIn) {
            var options = {
              location: 'no',
              clearcache: 'no',
              toolbar: 'yes',
              closebuttoncaption: '退出'
            };


            $cordovaInAppBrowser.open("http://activity.coolfen.com:8000/Game/index.html?mobileNo=" + $localStorage.me.ID, '_blank', options)
          } else {
            $scope.$parent.openLoginModal();
          }
        }


    });
})();

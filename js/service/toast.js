// 消息提示服务
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')
    .factory('Toast', ['$cordovaToast', 'ionicToast', function ($cordovaToast, ionicToast) {

    return {
        show: function (msg) {
            //return alert(msg);
            //return $cordovaToast.showShortBottom(msg);
          return ionicToast.show(msg, 'bottom', false, 2500);
        },

        showStick:function(msg){
            return ionicToast.show(msg,'bottom',true,5000);
        },

        hide:function(){
            return ionicToast.hide();
        }
    }
}]);
})();

"use strict";

angular.module('CoolfenMobileApp.directives')
  .directive('favoriteBox', function ($timeout,Device) {
    return {
      restrict: "E",
      templateUrl: "templates/home/favoriteBox.html",
      replace: true,
      link: function (scope, element, attrs) {

      	var store=document.getElementById('tradingRecord');
        var tradingRecord = document.getElementById('tradingRecord');
        //var activity = document.getElementById('activity');
        var phone = document.getElementById('phone');
        var location = document.getElementById('location');
//      var yy = document.getElementById('yy');
        var animate = false;


        scope.clickFavorite = function () {
          if (animate) {

            return;
          }

          if (scope.showFavorite) {
          	$('#store').css('background-image','url(img/home/store.png)');
          	$('.favorite-item').css('display','none');
            //yy.classList.remove('f_yy');
            tradingRecord.classList.add('trading-record-out');
            //activity.classList.add('activity-out');
            phone.classList.add('phone-out');
            location.classList.add('location-out');
            scope.showFavorite = false;
            animate = true;

            $timeout(function () {
            	$('#store').css('background-image','url(img/home/store.png)');
            	$('.favorite-item').css('display','none');
              tradingRecord.classList.remove('trading-record-out');
              //activity.classList.remove('activity-out');
              phone.classList.remove('phone-out');
              location.classList.remove('location-out');

              tradingRecord.style['right'] = '10px';
              //activity.style['right'] = '22px';
              phone.style['right'] = '10px';
              location.style['right'] = '10px';
              //document.body.clientWidth
              animate = false;
            }, 600);
          } else {
          	$('#store').css('background-image','url(img/home/store1.png)');
          	$('.favorite-item').css('display','block');
            //yy.classList.add('f_yy');
            tradingRecord.classList.add('trading-record-in');
            //activity.classList.add('activity-in');
            phone.classList.add('phone-in');
            location.classList.add('location-in');
            scope.showFavorite = true;
            animate = true;
            var right = 0;

            $timeout(function (right1,right2,right3) {

							if(Device.screen.width <=375 && Device.screen.width >320){
                right1 = 82;
                right2 = 155;
                right3 = 230;
              }else if(Device.screen.width>=414){
                right1 =95;
                right2 = 180;
                right3 = 265;
              }else if(Device.screen.width<=320){
              	right1 = 78;
                right2 = 145;
                right3 = 210;
              }else{
                right1 = 82;
                right2 = 155;
                right3 = 230;
              }

              tradingRecord.classList.remove('trading-record-in');
              //activity.classList.remove('activity-in');
              phone.classList.remove('phone-in');
              location.classList.remove('location-in');

              tradingRecord.style['right'] = right1 +'px';
              //activity.style['bottom'] = '142px';
              phone.style['right'] = right2+'px';
              location.style['right'] = right3+'px';

              animate = false;
            }, 900);

          }


          //if (scope.showFavorite) {
          //  //yy.classList.remove('f_yy');
          //  tradingRecord.classList.add('trading-record-out');
          //  //activity.classList.add('activity-out');
          //  phone.classList.add('phone-out');
          //  location.classList.add('location-out');
          //  scope.showFavorite = false;
          //  animate = true;
          //
          //  $timeout(function () {
          //    tradingRecord.classList.remove('trading-record-out');
          //    //activity.classList.remove('activity-out');
          //    phone.classList.remove('phone-out');
          //    location.classList.remove('location-out');
          //
          //    tradingRecord.style['right'] = '22px';
          //    //activity.style['right'] = '22px';
          //    phone.style['right'] = '22px';
          //    location.style['right'] = '22px';
          //    //document.body.clientWidth
          //    animate = false;
          //  }, 600);
          //} else {
          //  //yy.classList.add('f_yy');
          //  tradingRecord.classList.add('trading-record-in');
          //  //activity.classList.add('activity-in');
          //  phone.classList.add('phone-in');
          //  location.classList.add('location-in');
          //  scope.showFavorite = true;
          //  animate = true;
          //
          //  $timeout(function () {
          //    tradingRecord.classList.remove('trading-record-in');
          //    //activity.classList.remove('activity-in');
          //    phone.classList.remove('phone-in');
          //    location.classList.remove('location-in');
          //
          //    tradingRecord.style['right'] = '22px';
          //    //activity.style['bottom'] = '142px';
          //    phone.style['right'] = '22px';
          //    location.style['right'] = '22px';
          //    animate = false;
          //  }, 900);
          //}
        }
      }
    }
  })

/**
 * Created by Donny on 2015/9/23.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')

    .factory('Geolocation', function ($interval, $q, $rootScope, $http, $ionicPlatform, $cordovaGeolocation) {
      var watchId = null;
      var position = null;
      var highAccuracyOptions = {maximumAge: 600000, timeout: 5000, enableHighAccuracy: true};
      var lowAccuracyOptions = {maximumAge: 600000, timeout: 10000, enableHighAccuracy: false};

      return {
        // 获取坐标位置
        getPosition: function () {
          return position;
        },

        // 获取当前地理位置
        getGeoLocation: function () {
          $ionicPlatform.ready(function () {
            var deferred = $q.defer();
            if(ionic.Platform.isAndroid()&&window.plugins) {
              //通过百度sdk来获取经纬度,并且alert出经纬度信息
              var noop = function () {
              };
              window.locationService.getCurrentPosition(function (pos) {
                //alert(JSON.stringify(pos));
                position = {
                  lng: pos.coords.longitude,
                  lat: pos.coords.latitude
                };
                deferred.resolve(position);
                window.locationService.stop(noop, noop)
              }, function (e) {
                //alert(JSON.stringify(e));
                window.locationService.stop(noop, noop);
                $cordovaGeolocation.getCurrentPosition(highAccuracyOptions)
                    .then(function (pos) {
                      var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);
                      // GPS坐标转百度坐标
                      BMap.Convertor.translate(gpsPoint, function (point) {

                        position = {
                          lng: point.lng,
                          lat: point.lat
                        };

                        deferred.resolve(position);
                      });
                    }, function (err) {
                      $cordovaGeolocation.getCurrentPosition(lowAccuracyOptions)
                          .then(function (pos) {
                            var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                            // GPS坐标转百度坐标
                            BMap.Convertor.translate(gpsPoint, function (point) {
                              position = {
                                lng: point.lng,
                                lat: point.lat
                              };

                              deferred.resolve(position);
                            });
                          }, function (err) {
                            position = null;
                            deferred.resolve(err.message);
                          });
                    }
                );
              });
            }
            else{
              $cordovaGeolocation.getCurrentPosition(highAccuracyOptions)
                  .then(function (pos) {
                    var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);
                    // GPS坐标转百度坐标
                    BMap.Convertor.translate(gpsPoint, function (point) {

                      position = {
                        lng: point.lng,
                        lat: point.lat
                      };

                      deferred.resolve(position);
                    });
                  }, function (err) {
                    $cordovaGeolocation.getCurrentPosition(lowAccuracyOptions)
                        .then(function (pos) {
                          var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                          // GPS坐标转百度坐标
                          BMap.Convertor.translate(gpsPoint, function (point) {
                            position = {
                              lng: point.lng,
                              lat: point.lat
                            };

                            deferred.resolve(position);
                          });
                        }, function (err) {
                          position = null;
                          deferred.resolve(err.message);
                        });
                  }
              );
            }

            return deferred.promise;
          })
        },

        // 持续获取地理位置
        watchGeoLocation: function () {
          $ionicPlatform.ready(function () {
            watchId = $interval(function () {
              if(ionic.Platform.isAndroid()) {
                //通过百度sdk来获取经纬度,并且alert出经纬度信息
                var noop = function () {
                };
                window.locationService.getCurrentPosition(function (pos) {
                  //alert(JSON.stringify(pos));
                  position = {
                    lng: pos.coords.longitude,
                    lat: pos.coords.latitude
                  };
                  $rootScope.$broadcast('auth:positionChanged', position);
                  window.locationService.stop(noop, noop);
                }, function (e) {
                  //alert(JSON.stringify(e));
                  window.locationService.stop(noop, noop);
                  $cordovaGeolocation.getCurrentPosition(highAccuracyOptions)
                      .then(function (pos) {
                        var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                        // GPS坐标转百度坐标
                        BMap.Convertor.translate(gpsPoint, function (point) {
                          if (!angular.equals(position, point)) {
                            position = {
                              lng: point.lng,
                              lat: point.lat
                            };

                            $rootScope.$broadcast('auth:positionChanged', position);
                          }
                        })
                      }, function (err) {
                        $cordovaGeolocation.getCurrentPosition(lowAccuracyOptions)
                            .then(function (pos) {
                              var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                              // GPS坐标转百度坐标
                              BMap.Convertor.translate(gpsPoint, function (point) {
                                if (!angular.equals(position, point)) {
                                  position = {
                                    lng: point.lng,
                                    lat: point.lat
                                  };

                                  $rootScope.$broadcast('auth:positionChanged', position);
                                }
                              })
                            }, function (err) {
                              position = null;
                            });
                      });
                });
              }
              else{
                $cordovaGeolocation.getCurrentPosition(highAccuracyOptions)
                    .then(function (pos) {
                      var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                      // GPS坐标转百度坐标
                      BMap.Convertor.translate(gpsPoint, function (point) {
                        if (!angular.equals(position, point)) {
                          position = {
                            lng: point.lng,
                            lat: point.lat
                          };

                          $rootScope.$broadcast('auth:positionChanged', position);
                        }
                      })
                    }, function (err) {
                      $cordovaGeolocation.getCurrentPosition(lowAccuracyOptions)
                          .then(function (pos) {
                            var gpsPoint = new BMap.Point(pos.coords.longitude, pos.coords.latitude);

                            // GPS坐标转百度坐标
                            BMap.Convertor.translate(gpsPoint, function (point) {
                              if (!angular.equals(position, point)) {
                                position = {
                                  lng: point.lng,
                                  lat: point.lat
                                };

                                $rootScope.$broadcast('auth:positionChanged', position);
                              }
                            })
                          }, function (err) {
                            position = null;
                          });
                    });
              }

            }, 60000);
          })
        },

        // 清除持续获取地理位置事件
        clearWatch: function () {
          $interval.cancel(watchId);
          watchId = undefined;
        },

        // 返回两点之间的距离，单位是Km
        getDistance: function (lng1, lat1, lng2, lat2) {
          var R = 6371; // km
          var dLat = (lat2 - lat1).toRad();
          var dLng = (lng2 - lng1).toRad();
          var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return (R * c).toFixed(1);
        }
      };
    });

  Number.prototype.toRad = function () {
    return this * Math.PI / 180;
  };
})();

/**
 * Created by Donny on 2015/11/30.
 */
angular.module('CoolfenMobileApp.services')

/**
 * device information service
 */
  .factory('Device', function () {
    var device = {
      screen: {}
    };

    /**
     * get screen logical height
     */
    device.screen.height = window.screen.height;

    /**
     * get screen logical width
     */
    device.screen.width = window.screen.width;

    return device;
  });

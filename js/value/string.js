/**
 * Created by Donny on 2015/9/23.
 */
(function () {
  "use strict";

  var prodURL = 'https://api.coolfen.com/',
    demoURL = 'https://tfs.coolfen.com/apidemo/',
    testURL = 'https://apitest.coolfen.com:44301/',
    localUrl = 'https://192.168.0.112/WebApi/',
    cdnURL = 'http://web.coolfen.com/',
    Urls = {
      Prod_Cfg: {
        api: prodURL + 'api/',
        img: cdnURL + 'bg/',
        hub: prodURL+'signalr'
      },
      Demo_Cfg: {
        api: demoURL + 'api/',
        img: cdnURL + 'bg/',
        hub: demoURL+'signalr'
      },
      Test_Cfg: {
        api: testURL + 'api/',
        img: cdnURL + 'bg/',
        hub: testURL+'signalr'
      },
      Local_Cfg: {
        api: localUrl + 'api/',
        img: cdnURL + 'bg/',
        hub: localUrl+'signalr'
      }
    };

  angular.module('CoolfenMobileApp.string')

    .constant('STRING', {
      APP_VERSION: {
        DEV: '2.4.2',
        RELEASE: '2.4.2'
      }
    })
    .constant('URL_CFG', Urls.Prod_Cfg);

})();

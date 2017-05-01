// 个人账单服务
/**
 * Created by wangxidong on 2015/10/10.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services').
    factory('bill', ['$http','URL_CFG',  function ($http, URL_CFG) {
  var GetUserAllTransactionUrl = URL_CFG.api + 'Transaction/GetUserAllTransaction';

  return {
    // 个人账单-我的账单
    getFlow: function (json, successFn, errorFn) {
      return $http.post(GetUserAllTransactionUrl, json)
        .success(successFn)
        .error(errorFn)
    }
  };
}])
})();

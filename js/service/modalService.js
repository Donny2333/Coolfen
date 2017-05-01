/**
 * Created by SF002 on 2015/11/30.
 */
(function () {
  "use strict";
  angular.module('CoolfenMobileApp.services')

    .service('ModalService', function($ionicModal, $rootScope) {


      var init = function(tpl, $scope) {

        var promise;
        $scope = $scope || $rootScope.$new();

        promise = $ionicModal.fromTemplateUrl(tpl, {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          return modal;
        });

        $scope.openModal = function() {
          $scope.modal.show();
        };
        $scope.closeModal = function() {
          $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
          $scope.modal.remove();
        });

        return promise;
      }

      return {
        init: init
      }

    })
})();

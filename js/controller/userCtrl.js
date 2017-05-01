/**
 * Created by wangxidong on 2015/10/10.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.controllers')

    .controller('userCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopup', '$timeout', 'user', '$ionicModal', '$ionicBackdrop', 'Auth', 'Card', '$ionicActionSheet', '$cordovaCamera', '$localStorage', 'Message',
      function ($scope, $rootScope, $stateParams, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $timeout, user, $ionicModal, $ionicBackdrop, Auth, Card, $ionicActionSheet, $cordovaCamera, $localStorage, Message) {
        $scope.member = {};
        //$scope.imageURI = false;
        $scope.imageURI = $localStorage.imageURI;
        $scope.imgSrc = $localStorage.imgSrc;
        $scope.sexSrc = '';
        //console.log("$scope.imageURI:"+$scope.imageURI);
        //console.log("$scope.imgSrc:"+$scope.imgSrc);
        $rootScope.$on('Auth:login', function (event, args) {
          loadInfo();
        });

        $scope.$on('$ionicView.enter', function (e) {
          $ionicScrollDelegate.$getByHandle('usersScroll').scrollTop();
          loadInfo();
        });

        //$scope.active = 'item1';

        $scope.setActive = function (type) {
          $scope.active = type;
          if (type == 'item1') {
            $scope.member.Gender = 0;
            $scope.sexSrc = 'img/my/man.png'
          } else {
            $scope.member.Gender = 1;
            $scope.sexSrc = 'img/my/woman.png'
          }
          $scope.onSaveInfo();
        };

        $scope.isActive = function (type) {
          return type === $scope.active;
        };

        function loadInfo() {
          $scope.member = {
            phone: Auth.getMe().phone,
            loggedIn: Auth.getMe().loggedIn,
            Username: Auth.getMe().Username,
            BalancePoints: Auth.getMe().BalancePoints,
            Tenant: Auth.getMe().Tenant,
            Gender: Auth.getMe().Gender,
            Email: Auth.getMe().Email,
            ID: Auth.getMe().ID,
            Birthday: Auth.getMe().Birthday
          }
          if (_.isUndefined($scope.member.Birthday) || _.isEmpty($scope.member.Birthday)) {
            $scope.member.Birthday = '1990-1-1';
          }

          if (_.isUndefined($scope.member.Gender) || _.isEmpty($scope.member.Gender)) {
            $scope.member.Gender = 0;
          }

          //user.MobileUserInfo(function (request) {
          //  if (request.Value && request.ErrorCode == 0) {
          //    //$scope.member = request.Value;
          //    $scope.member.MobilePhoneNumber=request.Value.MobilePhoneNumber;
          //    $scope.member.Username=request.Value.Username;
          //    $scope.member.BalancePoints=request.Value.BalancePoints;
          //    $scope.member.Tenant=request.Value.Tenant;
          //    $scope.member.Gender=request.Value.Gender;
          //    $scope.member.Email=request.Value.Email;
          //    $scope.member.ID=request.Value.ID;
          //    $scope.member.Birthday=request.Value.Birthday;
          //    //user.setInfo($scope.member);
          //  } else {
          //    $scope.isError = true;
          //    $scope.error = request.ErrorMessages;
          //
          //    $timeout(function () {
          //      $scope.isError = false;
          //    }, 2000);
          //  }
          //}, function (err) {
          //  $scope.isError = true;
          //  $scope.error = '与服务器连接失败：' + angular.toJson(err);
          //
          //  $timeout(function () {
          //    $scope.isError = false;
          //  }, 2000);
          //})
          if(Auth.getMe().Gender ==0 ){
            $scope.sexSrc = 'img/my/man.png'
            $scope.active = 'item1'
          }else{
            $scope.sexSrc = 'img/my/woman.png'
            $scope.active = 'item2'
          }
        }

        $scope.onSaveInfo = function () {
          //$ionicLoading.show({
          //  template: '<ion-spinner icon="ios"></ion-spinner><br>  ',
          //  showBackdrop: true
          //});

          user.WrapperAccountUpdateInfo($scope.member, function (data) {
            //$ionicLoading.hide();

            if (data && data.ErrorCode == 0) {
              //$scope.isSuccess = true;
              //$scope.message = '修改会员信息成功！';
              //user.setInfo($scope.member);
              Auth.setMe(
                $scope.member.phone,
                $scope.member.loggedIn,
                $scope.member.Username,
                $scope.member.BalancePoints,
                $scope.member.Tenant,
                $scope.member.Gender,
                $scope.member.Email,
                $scope.member.ID,
                $scope.member.Birthday);

              $rootScope.$broadcast('user:update', {refreshCardBag: true});

              //$timeout(function () {
              //  $scope.isSuccess1 = false;
              //}, 2000);
            } else {
              //$scope.isError = true;
              //$scope.error = data.ErrorMessages[0];
              //
              //$timeout(function () {
              //  $scope.isError = false;
              //}, 2000);
            }
          }, function (err) {
            $ionicLoading.hide();

            //$scope.isError = true;
            //$scope.error = '与服务器连接失败：' + angular.toJson(err);
            //
            //$timeout(function () {
            //  $scope.isError = false;
            //}, 2000);
          })
        };

        $scope.goHome = function () {
          user.goHome();
        };

        //生日
        $scope.dtPicker = {
          date: null,
          dateConfig: {startView: 'day', minView: 'day'}
        };

        $scope.onSelectDate = function () {
          $scope.openModal();
        };

        $ionicModal.fromTemplateUrl('tpls/common/datePicker.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.modal = modal;
        });

        $scope.openModal = function () {
          //if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          //    cordova.plugins.Keyboard.close();
          //}
          if ($scope.modal.isShown()) {
            return;
          }
          //if (_.isUndefined($scope.member.Birthday) || _.isEmpty($scope.member.Birthday)) {
          //    $scope.dtPicker.date = '1990-1-1';
          //} else {
          //    $scope.dtPicker.date = $scope.member.Birthday;
          //}

          $scope.dtPicker.date = $scope.member.Birthday;
          $timeout(function () {
            //$ionicBackdrop.retain();
            $scope.modal.show();
          });
        };
        $scope.closeDateModal = function () {
          $scope.modal.hide();
          $scope.onSaveInfo();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
          $scope.modal.remove();
        });

        $scope.onDateSet = function (newDate, oldDate) {
          $scope.member.Birthday = moment(newDate).format('YYYY-MM-DD');
          $scope.closeDateModal();
        };
        $scope.$on('modal.hidden', function () {
          //$ionicBackdrop.release();
        });

        //修改
        $scope.blur = function () {
          $scope.onSaveInfo();
        }

        //上传头像
        $scope.show = function () {
          $ionicActionSheet.show({
            buttons: [
              {text: '拍照'},
              {text: '从相册选择'}
            ],
            cancelText: '取消',
            cancel: function () {
            },
            buttonClicked: function (index) {
              if (index == 0) {
                takePhoto();

              } else if (index == 1) {
                $cordovaCamera.getPicture({
                  quality: 100,
                  destinationType: Camera.DestinationType.DATA_URL,
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  allowEdit: true,
                  encodingType: Camera.EncodingType.JPEG,
                  popoverOptions: CameraPopoverOptions,
                  saveToPhotoAlbum: false
                }).then(function (imageData) {
                  $localStorage.imageURI = true;
                  $localStorage.imgSrc = "data:image/jpeg;base64," + imageData;
                  $scope.imageURI = $localStorage.imageURI;
                  $scope.imgSrc = $localStorage.imgSrc;
                  $rootScope.$broadcast('user:photo');
                  //console.log("t$scope.imageURI:"+$scope.imageURI);
                  //console.log("t$scope.imgSrc:"+$scope.imgSrc);
                }, function (err) {
                  //alert('An error has occured');
                });
              }
              return true;
            }
          });
        };

        //拍照
        function takePhoto() {
          var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true
          };
          $cordovaCamera.getPicture(options).then(function (imageData) {
            $localStorage.imageURI = true;
            $localStorage.imgSrc = "data:image/jpeg;base64," + imageData;
            //$ionicLoading.show({
            //  template: '<ion-spinner icon="ios"></ion-spinner><br> 头像上传中... ',
            //  showBackdrop: false,
            //  delay:3000
            //});
            $scope.imageURI = $localStorage.imageURI;
            $scope.imgSrc = $localStorage.imgSrc;
            $rootScope.$broadcast('user:photo');
            if (!$scope.$$phase)$scope.$apply();
          }, function (err) {
            $ionicLoading.hide();
          }).finally(function () {
            $ionicLoading.hide();
            Toast.show('修改成功');
          });
        }


      }])
})();

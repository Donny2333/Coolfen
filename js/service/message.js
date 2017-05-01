/**
 * Created by Donny on 2015/10/20.
 */
(function () {
  "use strict";

  angular.module('CoolfenMobileApp.services')

    .factory('Message', function ($rootScope, $http, $q, URL_CFG, $localStorage, $timeout) {
      var baseUrl = URL_CFG.api;
      var messageList = [];

      // 将newMessageBox存入oldMessageBox结构中
      var concatMessage = function (oldMessageBox, newMessageBox) {
        var outputMessages = newMessageBox.Messages;
        for (var i = 0; i < outputMessages.length; i++) {
          var message = {
            ID: outputMessages[i].ID,
            content: outputMessages[i].Content,
            sendTime: outputMessages[i].Created,
            showMessage: outputMessages[i].Show,
            readOver: outputMessages[i].Read
          };
          oldMessageBox.messageDetail.splice(i, 0, message);
        }

        oldMessageBox.updateTime = newMessageBox.UpdateTime;
        oldMessageBox.Category = newMessageBox.Category;
        oldMessageBox.latestMessageContent = newMessageBox.LastMessage;
        oldMessageBox.notReadMessageNumber += newMessageBox.UnReadCount;
      };

      // 将本地缓存中没有的消息存入messageList中
      var saveMessage = function (messageList, newMessageBox, i) {
        var messageBox = {
          from: {
            merchantID: newMessageBox.Merchant.ID,
            merchantChineseName: newMessageBox.Merchant.Name.Chinese
          },
          to: {
            userID: newMessageBox.User.ID,
            userName: newMessageBox.User.Username
          },
          Category: newMessageBox.Category,
          updateTime: newMessageBox.UpdateTime,
          latestMessageContent: newMessageBox.LastMessage,
          notReadMessageNumber: newMessageBox.UnReadCount,
          messageDetail: []
        };

        var outputMessages = newMessageBox.Messages;
        for (var j = 0; j < outputMessages.length; j++) {
          var message = {
            ID: outputMessages[j].ID,
            content: outputMessages[j].Content,
            sendTime: outputMessages[j].Created,
            showMessage: outputMessages[j].Show,
            readOver: outputMessages[j].Read
          };

          messageBox.messageDetail.push(message);
        }
        messageList.splice(i, 0, messageBox);
      };

      // 保存新消息
      var saveNewMessage = function (newMessage) {
        messageList = $localStorage.messageList;

        for (var i = 0; i < newMessage.length; i++) {
          // 遍历本地缓存查询是否已经有该商户发送过的消息
          var find = false;

          for (var j = 0; j < messageList.length; j++) {
            if (newMessage[i].Merchant.Name.Chinese === messageList[j].from.merchantChineseName) {
              concatMessage(messageList[j], newMessage[i]);
              find = true;
              break;
            }
          }
          if (!find) {
            saveMessage(messageList, newMessage[i], i);
          }
        }
      };

      // 当消息数据发生变化时，强制更新消息列表
      var updateMessageList = function () {
        for (var i = 0; i < messageList.length; i++) {
        }
      };

      return {
        // 获取最新消息列表并保存到messageList变量中,如果本地缓存有messageList，
        // 则直接从本地缓存中取，并且给询问后台是否有新消息,反之，则直接拉取所有消息
        getMessageList: function () {

          var deferred = $q.defer();

          if ($localStorage.messageList) {
            // 从后台拉新消息
            var messageCacheTime = "";

            if ($localStorage.messageList.length > 0) {
              messageCacheTime = $localStorage.messageList[0].updateTime;
            }

            var json = {
              Value: messageCacheTime
            };

            $http.post(baseUrl + 'Interaction/GetNewMessage', json)
              .success(function (data) {
                if (data.ErrorCode === 0) {
                  saveNewMessage(data.Outputs);
                  $timeout(function () {
                    $localStorage.messageList = messageList;
                  }, 0);
                  deferred.resolve(messageList);
                } else {
                  deferred.reject(data.ErrorMessages[0]);
                }
              })
              .error(function (err) {
                deferred.reject('与服务器连接失败：' + angular.toJson(err));
              });
          } else {
            // 从后台拉所有消息
            $http.post(baseUrl + 'Interaction/GetMessage')
              .success(function (data) {

                if (data.ErrorCode === 0) {
                  messageList = [];
                  var outputs = data.Outputs;

                  // 填充messageList结构体
                  for (var i = 0; i < outputs.length; i++) {
                    var messageBox = {
                      from: {
                        merchantID: outputs[i].Merchant.ID,
                        merchantChineseName: outputs[i].Merchant.Name.Chinese
                      },
                      to: {
                        userID: outputs[i].User.ID,
                        userName: outputs[i].User.Username
                      },
                      Category: outputs[i].Category,
                      updateTime: outputs[i].UpdateTime,
                      latestMessageContent: outputs[i].LastMessage,
                      notReadMessageNumber: outputs[i].UnReadCount,
                      messageDetail: []
                    };

                    // 填充messageList中的messageDetail结构体
                    var outputMessages = outputs[i].Messages;
                    for (var j = 0; j < outputMessages.length; j++) {
                      var message = {
                        ID: outputMessages[j].ID,
                        content: outputMessages[j].Content,
                        sendTime: outputMessages[j].Created,
                        showMessage: outputMessages[j].Show,
                        readOver: outputMessages[j].Read
                      };

                      messageBox.messageDetail.push(message);
                    }
                    messageList.push(messageBox);
                  }
                  deferred.resolve(messageList);
                  $localStorage.messageList = messageList;
                } else {
                  deferred.reject(data.ErrorMessages[0]);
                }
              })
              .error(function (err) {
                deferred.reject('与服务器连接失败：' + angular.toJson(err));
              });
          }

          return deferred.promise;
        },

        // 询问后台是否有新消息
        HasNewMessages: function () {
          var deferred = $q.defer();

          $http.post(baseUrl + 'Interaction/HasNewMessages')
            .success(function (data) {
              if (data.ErrorCode === 0) {
                if (data.Value === true) {
                  $rootScope.newMessage = true;
                  deferred.resolve(data.Value);
                }
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (data) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            });

          return deferred.promise;
        },

        clearMessage: function () {
          messageList = [];
          delete $localStorage.messageList;
        },

        // 获取messageBox
        getMessageBox: function (index) {
          return messageList[index];
        },

        // 删除messageBox
        deleteMessageBox: function (index) {
          var deferred = $q.defer();
          var json = [];

          messageList[index].messageDetail.forEach(function (messageDetail) {
            json.push(messageDetail.ID);
          })
          messageList.splice(index, 1);
          $localStorage.messageList = messageList;

          $http.post(baseUrl + 'Interaction/HideMessages', json)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                deferred.resolve(data.Outputs);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            })
          return deferred.promise;
        },

        // 删除message
        deleteMessage: function (index, message) {
          var deferred = $q.defer();
          var json = [];

          json.push(messageList[index].messageDetail[message].ID);
          messageList[index].messageDetail.splice(message, 1);
          if (messageList[index].messageDetail.length > 0) {
            messageList[index].latestMessageContent = messageList[index].messageDetail[0].content;
            messageList[index].updateTime = messageList[index].messageDetail[0].sendTime;
          }
          $localStorage.messageList = messageList;


          $http.post(baseUrl + 'Interaction/HideMessages', json)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                deferred.resolve(data.Outputs);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            })
          return deferred.promise;
        },

        // 标记消息已读
        readOverMessage: function (index) {
          var deferred = $q.defer();
          var json = [];

          if (messageList[index].messageDetail.length === 0) {
            messageList.splice(index, 1);
            $localStorage.messageList = messageList;
            return;
          }

          messageList[index].messageDetail.forEach(function (messageDetail) {
            //if (!messageDetail.readOver) {
            //  messageDetail.readOver = true;
            //  json.push(messageDetail.ID);
            //}
            json.push(messageDetail.ID);
          })
          messageList[index].notReadMessageNumber = 0;
          $localStorage.messageList = messageList;

          $http.post(baseUrl + 'Interaction/ReadMessages', json)
            .success(function (data) {
              if (data.ErrorCode == 0) {
                deferred.resolve(data.Outputs);
              } else {
                deferred.reject(data.ErrorMessages[0]);
              }
            })
            .error(function (err) {
              deferred.reject('与服务器连接失败：' + angular.toJson(err));
            })
          return deferred.promise;
        }
      }
    }
  )
})();

/**
 * ChatJS 1.0 - MIT License
 * www.chatjs.net
 * 
 * Copyright (c) 2013, André Pena
 * All rights reserved.
 *
 **/

// More about adapters: https://github.com/andrerpena/chatjs/wiki/The-anatomy-of-a-ChatJS-adapter
// About the SignalR adapter: https://github.com/andrerpena/chatjs/wiki/Getting-up-and-running-with-SignalR

function SignalRAdapter() {
    /// <summary>
    /// SignalR adapter for ChatJS. In order to use this adapter.. Pass an instance of this 
    /// function to $.chat()
    /// </summary>
}

SignalRAdapter.prototype = {
    init: function (chat, done) {
        /// <summary>This function will be called by ChatJs to initialize the adapter</summary>
        /// <param FullName="chat" type="Object"></param>
        var _this = this;


        // These are the methods that ARE CALLED BY THE SERVER.
        // Client functions should not call these functions.
        _this.hub = $.connection.chatHub;

        _this.hub.client.sendMessage = function (message) {
            _this.client.trigger("messages-changed", message);
        };

        _this.hub.client.sendTypingSignal = function (roomId, conversationId, userToId, user) {
            _this.client.trigger("typing-signal-received", {
                roomId: roomId,
                conversationId: conversationId,
                userToId: userToId,
                userFrom: user
            });
        };

        _this.hub.client.userListChanged = function (roomId, conversationId, userList) {
            _this.client.trigger("user-list-changed", {
                roomId: roomId,
                conversationId: conversationId,
                userList: userList
            });
        };

        if (!window.hubReady)
            window.hubReady = $.connection.hub.start();

        window.hubReady.done(function () {
            // function passed by ChatJS to the adapter to be called when the adapter initialization is completed
            done();
        });

        _this.client = {
            eventHandlers: [],
            on: function (eventName, handler) {
                /// <summary>Adds an event listener to the given event</summary>
                /// <param name="eventName" type="String">event name</param>
                /// <param name="handler" type="Function">Event handler function</param>
                var _this = this;
                if (!_this.eventHandlers[eventName]) {
                    _this.eventHandlers[eventName] = [];
                    _this.eventHandlers[eventName].trigger = function (data) {
                        // triggers each of the handlers
                        for (var i = 0; i < this.length; i++)
                            this[i](data);
                    };
                }
                _this.eventHandlers[eventName].push(handler);
                var a = 2;
            },
            trigger: function (eventName, data) {
                var _this = this;
                if (_this.eventHandlers[eventName])
                    _this.eventHandlers[eventName].trigger(data);
            }
        };


        // These are the methods that ARE CALLED BY THE CLIENT
        // Client functions should call these functions
        _this.server = new Object();

        _this.server.sendMessage = function (roomId, conversationId, otherUserId, messageText, clientGuid, done) {
            /// <summary>Sends a message to server</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user to which the message is being sent</param>
            /// <param FullName="messageText" type="String">Message text</param>
            /// <param FullName="clientGuid" type="String">Message client guid. Each message must have a client id in order for it to be recognized when it comes back from the server</param>
            /// <param FullName="done" type="Function">Function to be called when this method completes</param>
            _this.hub.server.sendMessage(roomId, conversationId, otherUserId, messageText, clientGuid).done(function (result) {
                if (done)
                    done(result);
            });
        };

        _this.server.sendTypingSignal = function (roomId, conversationId, userToId, done) {
            /// <summary>Sends a typing signal to the server</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user to which the typing signal is being sent</param>
            /// <param FullName="done" type="Function">Function to be called when this method completes</param>
            _this.hub.server.sendTypingSignal(roomId, conversationId, userToId).done(function (result) {
                if (done)
                    done(result);
            });
        };

        _this.server.getMessageHistory = function (roomId, conversationId, otherUserId, done) {
            /// <summary>Gets message history from the server</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the history</param>
            /// <param FullName="done" type="Number">Function to be called when this method completes</param>
            _this.hub.server.getMessageHistory(roomId, conversationId, otherUserId).done(function (result) {
                if (done)
                    done(result);
            });
        };

        _this.server.getUserInfo = function (userId, done) {
            /// <summary>Gets information about the user</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param FullName="done" type="Function">FUnction to be called when this method completes</param>
            _this.hub.server.getUserInfo(userId).done(function (result) {
                if (done)
                    done(result);
            });
        };

        _this.server.getUserList = function (params, done) {
            /// <summary>Gets the list of the users in the current room</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param FullName="done" type="Function">FUnction to be called when this method completes</param>
            _this.hub.server.getUserList(params.roomId, params.conversationId).done(function (result) {
                if (done)
                    done(result);
            });
        };

        // new in version 2.0
        _this.server.getRoomsList = function (done) {
            /// <summary>Gets the list of rooms available</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param FullName="done" type="Function">FUnction to be called when this method completes</param>
            _this.hub.server.getRoomsList().done(function (result) {
                if (done)
                    done(result);
            });
        };

        // new in version 2.0
        _this.server.enterRoom = function (roomId, done) {
            /// <summary>Gets the list of rooms available</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param FullName="done" type="Function">FUnction to be called when this method completes</param>
            _this.hub.server.enterRoom(roomId).done(function (result) {
                if (done)
                    done(result);
            });
        };

        // new in version 2.0
        _this.server.leaveRoom = function (roomId, done) {
            /// <summary>Gets the list of rooms available</summary>
            /// <param FullName="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param FullName="done" type="Function">FUnction to be called when this method completes</param>
            _this.hub.server.leaveRoom(roomId).done(function (result) {
                if (done)
                    done(result);
            });
        };
    }
}
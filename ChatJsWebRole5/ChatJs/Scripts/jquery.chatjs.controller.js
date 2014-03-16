/**
 * ChatJS 1.0 - MIT License
 * www.chatjs.net
 * 
 * Copyright (c) 2013, André Pena
 * All rights reserved.
 *
 **/

// CHAT
(function($) {

    // creates a chat user-list
    function ChatController(options) {
        var _this = this;

        // Defaults:
        _this.defaults = {
            userId: null,
            adapter: null,
            titleText: 'Chat',
            emptyRoomText: "There's no other users",
            typingText: " is typing...",
            allowRoomSelection: true,
            // when 'allowRoomSelection' is false, you are forced to specify a room id
            roomId: null,
            playSound: true
        };

        //Extending options:
        _this.opts = $.extend({}, _this.defaults, options);

        //Privates:
        _this.$el = null;

        // there will be one property on this object for each user in the chat
        // the property FullName is the other user id (toStringed)
        _this.chatWindows = new Object();
        _this.lastMessageCheckTimeStamp = null;
        _this.chatRoom = null;
        _this.usersById = {};
    }

    // Separate functionality from object creation
    ChatController.prototype = {
        init: function() {
            var _this = this;

            // the client functions are functions that must be called by the chat-adapter to interact
            // with the chat
            //_this.client = {
            //    sendMessage: function (message) {
            //        /// <summary>Called by the adapter when the OTHER user sends a message to the current user</summary>
            //        /// <param FullName="message" type="Object">Message object</param>
                    
            //        if (message.UserFromId != _this.opts.user.Id) {
            //            // in this case this message did not came from myself
            //            if (!_this.chatWindows[message.UserFromId])
            //                _this.createNewChatWindow(message.UserFromId);
            //            else
            //                _this.chatWindows[message.UserFromId].addMessage(message);
            //            if (_this.opts.playSound)
            //                _this.playSound("/chatjs/sounds/chat");

            //            // play sound here
            //        } else {
            //            if (_this.chatWindows[message.UserToId]) {
            //                _this.chatWindows[message.UserToId].addMessage(message);
            //            }
            //        }
            //    },

            //    sendTypingSignal: function(otherUserId) {
            //        /// <summary>Called by the adapter when the OTHER user is sending a typing signal to the current user</summary>
            //        /// <param FullName="otherUser" type="Object">User object (the other sending the typing signal)</param>
            //        if (_this.chatWindows[otherUserId]) {
            //            var otherUser = _this.usersById[otherUserId];
            //            _this.chatWindows[otherUserId].showTypingSignal(otherUser);
            //        }
            //    },

            //    userListChanged: function(usersList) {

            //        _this.usersById = {};
            //        _this.usersById[_this.opts.user.Id] = _this.opts.user;
            //        for (var i = 0; i < usersList.length; i++)
            //            _this.usersById[usersList[i].Id] = usersList[i];

            //        if (_this.chatRoom)
            //            _this.chatRoom.userListChanged(usersList);
            //    },

            //    showError: function(errorMessage) {
            //        // todo
            //    }
            //};

            // STUB: I'm creating a single chat room to keep background compatibility
            //_this.chatRoom = $.chatRoom({
            //    adapter: _this.opts.adapter,
            //    chatController: _this,
            //    user : _this.opts.user
            //});

            // getting the adapter started. You cannot call the adapter BEFORE this is done.
            _this.opts.adapter.init(_this, function() {
                /// <summary>Called by the adapter when all the adapter initialization is done already</summary>
                /// <param FullName="usersList" type=""></param>
                
                // assign handlers
                _this.opts.adapter.client.on("")

                _this.chatRooms = $.chatRooms({
                    adapter: _this.opts.adapter,
                    userId: _this.opts.userId
                });

                
            });

            
        },

        createNewChatWindow: function(otherUserId, initialToggleState, initialFocusState) {

            if (!initialToggleState)
                initialToggleState = "maximized";

            if (!initialFocusState)
                initialFocusState = "focused";

            var _this = this;

            var otherUser = _this.usersById[otherUserId];
            if (!otherUser)
                throw "Cannot find the other user in the list";

            // if this particular chat-window does not exist yet, create it
            var newChatWindow = $.chatPmWindow({
                chat: _this,
                myUser: _this.opts.user,
                otherUser: otherUser,
                newMessageUrl: _this.opts.newMessageUrl,
                messageHistoryUrl: _this.opts.messageHistoryUrl,
                initialToggleState: initialToggleState,
                initialFocusState: initialFocusState,
                userIsOnline: otherUser.Status == 1,
                adapter: _this.opts.adapter,
                typingText: _this.opts.typingText,
                onClose: function() {
                    delete _this.chatWindows[otherUser.Id];
                    $.organizeChatContainers();
                    _this.saveWindows();
                },
                onToggleStateChanged: function(toggleState) {
                    _this.saveWindows();
                }
            });

            // this cannot be in t
            _this.chatWindows[otherUser.Id.toString()] = newChatWindow;
            _this.saveWindows();
        },

        playSound: function(filename) {
            /// <summary>Plays a notification sound</summary>
            /// <param FullName="fileFullName" type="String">The file path without extension</param>
            var $soundContainer = $("#soundContainer");
            if (!$soundContainer.length)
                $soundContainer = $("<div>").attr("id", "soundContainer").appendTo($("body"));
            $soundContainer.html('<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>');
        },

        loadWindows: function() {
            var _this = this;
            var cookie = _this.readCookie("chat_state");
            if (cookie) {
                var openedChatWindows = JSON.parse(cookie);
                for (var i = 0; i < openedChatWindows.length; i++) {
                    var otherUserId = openedChatWindows[i].userId;
                    _this.opts.adapter.server.getUserInfo(otherUserId, function(user) {
                        if (user) {
                            if (!_this.chatWindows[otherUserId])
                                _this.createNewChatWindow(otherUserId, null, "blured");
                        } else {
                            // when an error occur, the state of this cookie invalid
                            // it must be destroyed
                            _this.eraseCookie("chat_state");
                        }
                    });
                }
            }
        },

        saveWindows: function() {
            var _this = this;
            var openedChatWindows = new Array();
            for (var otherUserId in _this.chatWindows) {
                openedChatWindows.push({
                    userId: otherUserId,
                    toggleState: _this.chatWindows[otherUserId].getToggleState()
                });
            }
            _this.createCookie("chat_state", JSON.stringify(openedChatWindows), 365);
        },

        eraseCookie: function(name) {
            var _this = this;
            _this.createCookie(name, "", -1);
        },

        readCookie: function(name) {
            var nameEq = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
            }
            return null;
        },

        createCookie: function(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }
    };

    // The actual plugin
    $.chat = function(options) {
        var chat = new ChatController(options);
        chat.init();
        return chat;
    };
})(jQuery);

// creates a chat user-list
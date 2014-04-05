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
        _this.options = $.extend({}, _this.defaults, options);

        //Privates:
        _this.$el = null;

        _this.pmWindows = new Object();
        _this.conversationWindows = new Object();
    }

    // Separate functionality from object creation
    ChatController.prototype = {
        init: function() {
            var _this = this;

            
            // getting the adapter started. You cannot call the adapter BEFORE this is done.
            _this.options.adapter.init(_this, function() {
                /// <summary>Called by the adapter when all the adapter initialization is done already</summary>
                /// <param FullName="usersList" type=""></param>

                // the controller must have a listener to the "messages-changed" event because it has to create
                // new PM windows when the user receives it
                _this.options.adapter.client.on("messages-changed", function (message) {
                    if (message.UserToId && message.UserToId == _this.options.userId && !_this.pmWindows[message.UserFromId]) {
                        _this.pmWindows[message.UserFromId] = $.chatPmWindow({
                            userId: _this.options.userId,
                            otherUserId: message.UserFromId,
                            adapter: _this.options.adapter,
                            typingText: _this.options.typingText
                        });
                    } else if (message.ConversationId && message.ConversationId == _this.options.conversationId && !_this.conversationWindows[message.ConversationId]) {
                        _this.pmWindows[message.ConversationId] = $.chatPmWindow({
                            userId: _this.options.userId,
                            conversationId: message.ConversationId,
                            adapter: _this.options.adapter,
                            typingText: _this.options.typingText
                        });
                    }
                });

                _this.chatRooms = $.chatRooms({
                    adapter: _this.options.adapter,
                    userId: _this.options.userId,
                    userClicked: function(userId) {
                        if (userId != _this.options.userId) {
                            // verify whether there's already a PM window for this user
                            if (_this.pmWindows[userId])
                                _this.pmWindows[userId].focus();
                            else
                                _this.pmWindows[userId] = $.chatPmWindow({
                                    userId: _this.options.userId,
                                    otherUserId: userId,
                                    adapter: _this.options.adapter,
                                    typingText: _this.options.typingText
                                });
                        }
                    }
                });
            });


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
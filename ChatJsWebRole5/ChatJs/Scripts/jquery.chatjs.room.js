// CHAT ROOM
(function($) {
    
    function ChatRoom(options) {

        this.defaults = {
            adapter: null,
            chatController: null,
            titleText: "Room",
            windowToggleState: null,
        };

        this.chatWindow = null;

        //Extending options:
        this.opts = $.extend({}, this.defaults, options);
    }

    ChatRoom.prototype = {

        init: function() {
            var _this = this;

            // will create user list chat container
            _this.chatWindow = $.chatWindow({
                title: _this.opts.titleText,
                showTextBox: false,
                canClose: false,
                initialToggleState: _this.opts.windowToggleState,
                onCreated: function(container) {
                    if (!container.$windowInnerContent.html()) {
                        $("<div/>").addClass("loading-box").appendTo(container.$windowInnerContent);
                    }
                },
                onToggleStateChanged: function(toggleState) {
                    _this.createCookie("main_window_chat_state", toggleState);
                }
            });

        },

        userListChanged: function (usersList) {
            /// <summary>Called by the adapter when the users list changes</summary>
            /// <param FullName="usersList" type="Object">The new user list</param>
            var _this = this;

            _this.chatWindow.getContent().html('');
            if (usersList.length == 0) {
                $("<div/>").addClass("user-list-empty").text(_this.opts.emptyRoomText).appendTo(_this.chatWindow.getContent());
            }
            else {
                for (var i = 0; i < usersList.length; i++) {
                    if (usersList[i].Id != _this.opts.user.Id) {
                        
                        var $userListItem = $("<div/>")
                            .addClass("user-list-item")
                            .attr("data-val-id", usersList[i].Id)
                            .appendTo(_this.chatWindow.getContent());

                        $("<img/>")
                            .addClass("profile-picture")
                            .attr("src", usersList[i].ProfilePictureUrl)
                            .appendTo($userListItem);

                        $("<div/>")
                            .addClass("profile-status")
                            .addClass(usersList[i].Status == 0 ? "offline" : "online")
                            .appendTo($userListItem);

                        $("<div/>")
                            .addClass("content")
                            .text(usersList[i].Name)
                            .appendTo($userListItem);

                        // makes a click in the user to either create a new chat window or open an existing
                        // I must clusure the 'i'
                        (function (otherUserId) {
                            // handles clicking in a user. Starts up a new chat session
                            $userListItem.click(function () {
                                if (_this.chatWindows[otherUserId]) {
                                    _this.chatWindows[otherUserId].focus();
                                } else
                                    _this.opts.chatController.createNewChatWindow(otherUserId);
                            });
                        })(usersList[i].Id);
                    }
                }
            }

            // update the online status of the remaining windows
            for (var i in _this.chatWindows) {
                if (_this.opts.chatController.usersById && _this.opts.chatController.usersById[i])
                    _this.chatWindows[i].setOnlineStatus(_this.opts.chatController.usersById[i].Status == 1);
                else
                    _this.chatWindows[i].setOnlineStatus(false);
            }

            _this.chatWindow.setVisible(true);
        }

        

        
    };

    // The actual plugin
    $.chatRoom = function (options) {
        var chat = new ChatRoom(options);
        chat.init();
        return chat;
    };


})(jQuery);










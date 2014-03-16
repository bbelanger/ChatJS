/// <reference path="jquery.chatjs.messageboard.js" />
(function ($) {

    function ChatRooms(options) {

        this.defaults = {
            adapter: null,
            userId: null,
            titleText: "Rooms",
            noRoomsText: "There's no rooms",
            windowToggleState: null,
        };

        this.chatWindow = null;
        this.tabs = null;

        //Extending options:
        this.opts = $.extend({}, this.defaults, options);
    }

    ChatRooms.prototype = {
        init: function () {
            var _this = this;

            // will create user list chat container
            _this.chatWindow = $.chatWindow({
                title: _this.opts.titleText,
                showTextBox: false,
                canClose: false,
                width: 400,
                height: 300,
                initialToggleState: _this.opts.windowToggleState,
                onCreated: function (window) {
                    var $ul = $("<ul/>").appendTo(window.$windowInnerContent);
                    _this.tabs = $ul.horizontalTabs().data("horizontalTabs");

                    // adds the available rooms tab
                    _this.tabs.addTab("available-rooms", "Available rooms", true, function ($content) {
                        _this.opts.adapter.server.getRoomsList(function (roomsList) {
                            $content.html('');
                            if (roomsList.length == 0) {
                                $("<div/>").addClass("user-list-empty").text(_this.opts.noRoomsText).appendTo($content);
                            } else {
                                for (var i = 0; i < roomsList.length; i++) {
                                    var $roomListItem = $("<div/>")
                                        .addClass("rooms-list-item")
                                        .attr("data-val-id", roomsList[i].Id)
                                        .appendTo($content);

                                    $roomListItem.hover(function () {
                                        $(this).addClass("hover");
                                    }, function () {
                                        $(this).removeClass("hover");
                                    });

                                    $("<span/>")
                                        .addClass("room-name")
                                        .text(roomsList[i].Name)
                                        .appendTo($roomListItem);

                                    $("<span/>")
                                        .addClass("users-online")
                                        .text(roomsList[i].UsersOnline + " online")
                                        .appendTo($roomListItem);

                                    $roomListItem.hover(function () {
                                        $(this).addClass("hover");
                                    }, function () {
                                        $(this).removeClass("hover");
                                    });

                                    (function (roomIndex) {
                                        $roomListItem.click(function () {
                                            if (_this.tabs.hasTab(roomsList[roomIndex].Id))
                                                _this.tabs.focusTab(roomsList[roomIndex].Id);
                                            else
                                                _this.enterRoom(roomsList[roomIndex].Id, roomsList[roomIndex].Name);
                                        });
                                    })(i);

                                }
                            }
                        });
                    });
                },
                onToggleStateChanged: function (toggleState) {
                    _this.createCookie("main_window_chat_state", toggleState);
                }
            });


        },

        enterRoom: function (roomId, roomName) {
            var _this = this;

            var $messageBoard;

            _this.tabs.addTab(roomId, roomName, true, function ($content) {
                // constructs the tab content
                var $contentWrapper = $("<div/>").addClass("content-wrapper").appendTo($content);
                var $users = $("<div/>").addClass("right-panel").appendTo($contentWrapper);
                var $leftPanel = $("<div/>").addClass("left-panel").appendTo($contentWrapper);

                $messageBoard = $leftPanel.messageBoard({
                    adapter: _this.opts.adapter,
                    userId: _this.opts.userId,
                    roomId: roomId
                });

                _this.opts.adapter.server.enterRoom(roomId, function () {
                    // loads the user list
                    $users.userList({
                        adapter: _this.opts.adapter,
                        roomId: roomId,
                        userClick: function (userId) { }
                    });
                });


            }, function () {
                // happens when the user focuses the tab
                if ($messageBoard && $messageBoard.data("messageBoard"))
                    $messageBoard.data("messageBoard").focus();
            });
        }
    };

    // The actual plugin
    $.chatRooms = function (options) {

        var chat = new ChatRooms(options);
        chat.init();
        return chat;
    };

})(jQuery);
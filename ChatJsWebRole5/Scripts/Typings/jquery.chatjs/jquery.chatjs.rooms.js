var ChatRoomsOptions = (function () {
    function ChatRoomsOptions() {
        this.titleText = "Rooms";
        this.noRoomsText = "There's no rooms";
    }
    return ChatRoomsOptions;
})();

var ChatRooms = (function () {
    function ChatRooms(options) {
        this.options = options;
    }
    ChatRooms.prototype.init = function () {
        var _this = this;
        // will create user list chat container
        this.chatWindow = $.chatWindow({
            title: this.options.titleText,
            showTextBox: false,
            canClose: false,
            canExpand: true,
            width: 400,
            height: 300,
            onCreated: function (window) {
                var $ul = $("<ul/>").appendTo(window.$windowInnerContent);
                _this.tabs = $ul.horizontalTabs().data("horizontalTabs");

                // adds the available rooms tab
                _this.tabs.addTab("available-rooms", "Available rooms", true, function ($content) {
                    _this.options.adapter.server.getRoomsList(function (roomsList) {
                        $content.html('');
                        if (roomsList.length == 0) {
                            $("<div/>").addClass("user-list-empty").text(_this.options.noRoomsText).appendTo($content);
                        } else {
                            for (var i = 0; i < roomsList.length; i++) {
                                var $roomListItem = $("<div/>").addClass("rooms-list-item").attr("data-val-id", roomsList[i].id).appendTo($content);

                                $roomListItem.hover(function () {
                                    $(this).addClass("hover");
                                }, function () {
                                    $(this).removeClass("hover");
                                });

                                $("<span/>").addClass("room-name").text(roomsList[i].name).appendTo($roomListItem);

                                $("<span/>").addClass("users-online").text(roomsList[i].usersOnline + " online").appendTo($roomListItem);

                                $roomListItem.hover(function () {
                                    $(this).addClass("hover");
                                }, function () {
                                    $(this).removeClass("hover");
                                });

                                (function (roomIndex) {
                                    $roomListItem.click(function () {
                                        if (_this.tabs.hasTab(roomsList[roomIndex].id))
                                            _this.tabs.focusTab(roomsList[roomIndex].id.toString());
                                        else
                                            _this.enterRoom(roomsList[roomIndex].id, roomsList[roomIndex].name);
                                    });
                                })(i);
                            }
                        }
                    });
                });
            },
            onToggleStateChanged: function (toggleState) {
                this.createCookie("main_window_chat_state", toggleState);
            }
        });
    };

    ChatRooms.prototype.enterRoom = function (roomId, roomName) {
        var _this = this;
        var $messageBoard;

        this.tabs.addTab(roomId, roomName, true, function ($content) {
            // constructs the tab content
            var $contentWrapper = $("<div/>").addClass("content-wrapper").appendTo($content);
            var $users = $("<div/>").addClass("right-panel").appendTo($contentWrapper);
            var $leftPanel = $("<div/>").addClass("left-panel").appendTo($contentWrapper);

            var messageBoardOptions = new MessageBoardOptions();
            messageBoardOptions.adapter = _this.options.adapter;
            messageBoardOptions.userId = _this.options.userId;
            messageBoardOptions.roomId = _this.options.roomId;
            messageBoardOptions.newMessage = function (message) {
                var focusedTabId = _this.tabs.getFucusedTabId();
                if (focusedTabId && focusedTabId != roomId && message.userFromId != _this.options.userId)
                    _this.tabs.addEventMark(roomId);
            };

            $messageBoard = $leftPanel.messageBoard(messageBoardOptions);

            _this.options.adapter.server.enterRoom(roomId, function () {
                // loads the user list
                var userListOptions = new UserListOptions();
                userListOptions.adapter = _this.options.adapter;
                userListOptions.roomId = roomId;
                userListOptions.userClicked = _this.options.userClicked;

                $users.userList(userListOptions);
            });
        }, function () {
            // happens when the user focuses the tab
            if ($messageBoard && $messageBoard.data("messageBoard"))
                $messageBoard.data("messageBoard").focus();
            var focusedTabId = _this.tabs.getFucusedTabId();
            if (focusedTabId)
                _this.tabs.clearEventMarks(focusedTabId);
        });
    };
    return ChatRooms;
})();

// The actual plugin
$.chatRooms = function (options) {
    var chatRooms = new ChatRooms(options);
    chatRooms.init();
    return chatRooms;
};
//# sourceMappingURL=jquery.chatjs.rooms.js.map

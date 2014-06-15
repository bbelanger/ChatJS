var ChatRoomsOptions = (function () {
    function ChatRoomsOptions() {
    }
    return ChatRoomsOptions;
})();

// represents the current state of the ChatRooms.
var ChatRoomsWindowState = (function () {
    function ChatRoomsWindowState() {
    }
    return ChatRoomsWindowState;
})();

// window that shows the rooms
var ChatRoomsWindow = (function () {
    function ChatRoomsWindow(options) {
        var _this = this;
        var defaultOptions = new ChatRoomsOptions();
        defaultOptions.titleText = "Rooms";
        defaultOptions.noRoomsText = "There's no rooms";
        defaultOptions.availableRoomsText = "Available rooms";
        defaultOptions.userClicked = function () {
        };
        defaultOptions.onStateChanged = function () {
        };
        defaultOptions.offsetRight = 10;
        defaultOptions.contentHeight = 235;
        defaultOptions.isMaximized = true;
        defaultOptions.chatJsContentPath = "/content/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.titleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.canExpand = true;
        chatWindowOptions.width = 400;
        chatWindowOptions.height = 300;
        chatWindowOptions.isMaximized = this.options.isMaximized;
        chatWindowOptions.onMaximizedStateChanged = function () {
            _this.options.onStateChanged();
        };

        // function to build the available rooms content
        var availableRoomsTabBuilder = function (roomList, $content) {
            $content.html('');
            var $roomListWrapper = $("<div/>").addClass("rooms-list").appendTo($content);
            ChatJsUtils.setOuterHeight($roomListWrapper, _this.options.contentHeight);
            if (roomList.length == 0) {
                $("<div/>").addClass("user-list-empty").text(_this.options.noRoomsText).appendTo($roomListWrapper);
            } else {
                for (var i = 0; i < roomList.length; i++) {
                    var $roomListItem = $("<div/>").addClass("rooms-list-item").attr("data-val-id", roomList[i].Id).appendTo($roomListWrapper);

                    $roomListItem.hover(function () {
                        $(this).addClass("hover");
                    }, function () {
                        $(this).removeClass("hover");
                    });

                    $("<span/>").addClass("room-name").text(roomList[i].Name).appendTo($roomListItem);

                    $("<span/>").addClass("users-online").text(roomList[i].UsersOnline + " online").appendTo($roomListItem);

                    $roomListItem.hover(function () {
                        $(this).addClass("hover");
                    }, function () {
                        $(this).removeClass("hover");
                    });

                    (function (roomIndex) {
                        // this is what happens when you click a room
                        $roomListItem.click(function () {
                            if (_this.tabs.hasTab(roomList[roomIndex].Id))
                                _this.tabs.focusTab(roomList[roomIndex].Id);
                            else
                                _this.enterRoom(roomList[roomIndex].Id, roomList[roomIndex].Name);
                            _this.options.onStateChanged();
                        });
                    })(i);
                }
            }
        };

        chatWindowOptions.onCreated = function (window) {
            var $ul = $("<ul/>").appendTo(window.$windowInnerContent);

            var horizontalTabOptions = new HorizontalTabsOptions();
            horizontalTabOptions.onTabClosed = function (id) {
                _this.options.adapter.server.leaveRoom(id, function () {
                });
            };

            _this.tabs = $ul.horizontalTabs(horizontalTabOptions).data("horizontalTabs");

            // adds the available rooms tab
            _this.tabs.addTab(0, _this.options.availableRoomsText, true, false, function ($content) {
                _this.options.adapter.server.getRoomsList(function (roomList) {
                    availableRoomsTabBuilder(roomList, $content);
                });
            }, function () {
                _this.options.onStateChanged();
            }, true, false);
        };

        // when the rooms change, the available rooms must be updated
        this.options.adapter.client.onRoomListChanged(function (roomList) {
            var availableRoomsTab = _this.tabs.getTab(0);
            availableRoomsTabBuilder(roomList.Rooms, availableRoomsTab.$content);
        });

        // will create user list chat container
        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }
    // enters the given room
    ChatRoomsWindow.prototype.enterRoom = function (roomId, roomName, saveState) {
        var _this = this;
        if (typeof saveState === "undefined") { saveState = true; }
        var $messageBoard;

        this.tabs.addTab(roomId, roomName, true, true, function ($content) {
            // constructs the tab content
            var $contentWrapper = $("<div/>").addClass("content-wrapper").appendTo($content);
            var $users = $("<div/>").addClass("right-panel").appendTo($contentWrapper);
            var $leftPanel = $("<div/>").addClass("left-panel").appendTo($contentWrapper);

            var messageBoardOptions = new MessageBoardOptions();
            messageBoardOptions.adapter = _this.options.adapter;
            messageBoardOptions.userId = _this.options.userId;
            messageBoardOptions.height = _this.options.contentHeight;
            messageBoardOptions.roomId = roomId;
            messageBoardOptions.chatJsContentPath = _this.options.chatJsContentPath;

            messageBoardOptions.newMessage = function (message) {
                var focusedTabId = _this.tabs.getFucusedTabId();
                if (focusedTabId != null && focusedTabId != roomId && message.UserFromId != _this.options.userId)
                    _this.tabs.addEventMark(roomId);
            };
            $messageBoard = $leftPanel.messageBoard(messageBoardOptions);

            _this.options.adapter.server.enterRoom(roomId, function () {
                // loads the user list
                var userListOptions = new UserListOptions();
                userListOptions.adapter = _this.options.adapter;
                userListOptions.roomId = roomId;
                userListOptions.height = _this.options.contentHeight;
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
            _this.options.onStateChanged();
        }, saveState, saveState);
    };

    ChatRoomsWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    // populates the current state in the passed 'state' object
    ChatRoomsWindow.prototype.getState = function () {
        var state = new ChatRoomsWindowState();
        state.isMaximized = this.chatWindow.getState();
        state.activeRoom = this.tabs.getFucusedTabId();
        state.openedRooms = this.tabs.getTabIds();
        return state;
    };

    // sets the current state using the passed 'state' object
    ChatRoomsWindow.prototype.setState = function (state) {
        var _this = this;
        this.options.adapter.server.getRoomsList(function (roomsList) {
            for (var i = 0; i < state.openedRooms.length; i++)
                if (!_this.tabs.hasTab(state.openedRooms[i])) {
                    for (var j = 0; j < roomsList.length; j++) {
                        if (roomsList[j].Id == state.openedRooms[i]) {
                            _this.enterRoom(roomsList[j].Id, roomsList[j].Name, false);
                            break;
                        }
                    }
                }

            // focus the room as stated in the state
            _this.tabs.focusTab(state.activeRoom, false);

            // sets the maximized state
            _this.chatWindow.setState(state.isMaximized);
        });
    };
    return ChatRoomsWindow;
})();

// The actual plugin
$.chatRooms = function (options) {
    var chatRooms = new ChatRoomsWindow(options);
    return chatRooms;
};
//# sourceMappingURL=jquery.chatjs.roomswindow.js.map

var ChatRoomsOptions = (function () {
    function ChatRoomsOptions() {
    }
    return ChatRoomsOptions;
})();

// represents the current state of the ChatRooms.
var ChatRoomsState = (function () {
    function ChatRoomsState() {
    }
    return ChatRoomsState;
})();

var ChatRooms = (function () {
    function ChatRooms(options) {
        var _this = this;
        var defaultOptions = new ChatRoomsOptions();
        defaultOptions.titleText = "Rooms";
        defaultOptions.noRoomsText = "There's no rooms";
        defaultOptions.userClicked = function () {
        };
        defaultOptions.stateChanged = function () {
        };
        defaultOptions.offsetRight = 10;

        this.options = $.extend({}, defaultOptions, options);

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.titleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.canExpand = true;
        chatWindowOptions.width = 400;
        chatWindowOptions.height = 300;
        chatWindowOptions.onCreated = function (window) {
            var $ul = $("<ul/>").appendTo(window.$windowInnerContent);
            _this.tabs = $ul.horizontalTabs().data("horizontalTabs");

            // adds the available rooms tab
            _this.tabs.addTab(0, "Available rooms", true, false, function ($content) {
                _this.options.adapter.server.getRoomsList(function (roomsList) {
                    $content.html('');
                    if (roomsList.length == 0) {
                        $("<div/>").addClass("user-list-empty").text(_this.options.noRoomsText).appendTo($content);
                    } else {
                        for (var i = 0; i < roomsList.length; i++) {
                            var $roomListItem = $("<div/>").addClass("rooms-list-item").attr("data-val-id", roomsList[i].Id).appendTo($content);

                            $roomListItem.hover(function () {
                                $(this).addClass("hover");
                            }, function () {
                                $(this).removeClass("hover");
                            });

                            $("<span/>").addClass("room-name").text(roomsList[i].Name).appendTo($roomListItem);

                            $("<span/>").addClass("users-online").text(roomsList[i].UsersOnline + " online").appendTo($roomListItem);

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
                                    _this.options.stateChanged();
                                });
                            })(i);
                        }
                    }
                });
            }, function () {
                _this.options.stateChanged();
            }, true, false);
        };

        // will create user list chat container
        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }
    ChatRooms.prototype.enterRoom = function (roomId, roomName, saveState) {
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
            messageBoardOptions.roomId = roomId;

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
            _this.options.stateChanged();
        }, saveState, saveState);
    };

    // returns the current Rooms state
    ChatRooms.prototype.getState = function () {
        var state = new ChatRoomsState();
        state.isMaximized = true; // TODO: fix it
        state.activeRoom = this.tabs.getFucusedTabId();
        state.openedRooms = this.tabs.getTabIds();
        return state;
    };

    // loads the given state
    ChatRooms.prototype.setState = function (state) {
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
            //TODO: take the isMaximized into account
        });
    };

    ChatRooms.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };
    return ChatRooms;
})();

// The actual plugin
$.chatRooms = function (options) {
    var chatRooms = new ChatRooms(options);
    return chatRooms;
};
//# sourceMappingURL=jquery.chatjs.rooms.js.map

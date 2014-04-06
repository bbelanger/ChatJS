interface JQueryStatic {
    chatRooms: (options: ChatRoomsOptions) => ChatRooms;
}

class ChatRoomsOptions {
    titleText: string;
    adapter: IAdapter;
    noRoomsText: string;
    userClicked: (userId: number) => void;
    userId: number;
    offsetRight: number;
}

class ChatRooms {
    constructor(options: ChatRoomsOptions) {

        var defaultOptions = new ChatRoomsOptions();
        defaultOptions.titleText = "Rooms";
        defaultOptions.noRoomsText = "There's no rooms";
        defaultOptions.userClicked = (userId: number) => { };
        defaultOptions.offsetRight = 10;

        this.options = $.extend({}, defaultOptions, options);

        // will create user list chat container
        this.chatWindow = $.chatWindow(<ChatWindowOptions> {
            title: this.options.titleText,
            showTextBox: false,
            canClose: false,
            canExpand: true,
            width: 400,
            height: 300,
            onCreated: window => {
                var $ul = $("<ul/>").appendTo(window.$windowInnerContent);
                this.tabs = $ul.horizontalTabs().data("horizontalTabs");

                // adds the available rooms tab
                this.tabs.addTab("available-rooms", "Available rooms", true, ($content) => {
                    this.options.adapter.server.getRoomsList((roomsList) => {
                        $content.html('');
                        if (roomsList.length == 0) {
                            $("<div/>").addClass("user-list-empty").text(this.options.noRoomsText).appendTo($content);
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

                                (roomIndex => {
                                    $roomListItem.click(() => {
                                        if (this.tabs.hasTab(roomsList[roomIndex].Id))
                                            this.tabs.focusTab(roomsList[roomIndex].Id.toString());
                                        else
                                            this.enterRoom(roomsList[roomIndex].Id, roomsList[roomIndex].Name);
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

        this.chatWindow.setRightOffset(this.options.offsetRight);
    }

    enterRoom(roomId, roomName): void {

        var $messageBoard;

        this.tabs.addTab(roomId, roomName, true, ($content) => {
            // constructs the tab content
            var $contentWrapper = $("<div/>").addClass("content-wrapper").appendTo($content);
            var $users = $("<div/>").addClass("right-panel").appendTo($contentWrapper);
            var $leftPanel = $("<div/>").addClass("left-panel").appendTo($contentWrapper);

            var messageBoardOptions = new MessageBoardOptions();
            messageBoardOptions.adapter = this.options.adapter;
            messageBoardOptions.userId = this.options.userId;
            messageBoardOptions.roomId = roomId;

            messageBoardOptions.newMessage = (message) => {
                var focusedTabId = this.tabs.getFucusedTabId();
                if (focusedTabId && focusedTabId != roomId && message.UserFromId != this.options.userId)
                    this.tabs.addEventMark(roomId);
            }

            $messageBoard = $leftPanel.messageBoard(messageBoardOptions);

            this.options.adapter.server.enterRoom(roomId, () => {
                // loads the user list

                var userListOptions = new UserListOptions();
                userListOptions.adapter = this.options.adapter;
                userListOptions.roomId = roomId;
                userListOptions.userClicked = this.options.userClicked;

                $users.userList(userListOptions);
            });


        }, () => {
                // happens when the user focuses the tab
                if ($messageBoard && $messageBoard.data("messageBoard"))
                    $messageBoard.data("messageBoard").focus();
                var focusedTabId = this.tabs.getFucusedTabId();
                if (focusedTabId)
                    this.tabs.clearEventMarks(focusedTabId);
            });
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    options: ChatRoomsOptions;
    chatWindow: ChatWindow;
    tabs: HorizontalTabs;
}

// The actual plugin
$.chatRooms = options => {
    var chatRooms = new ChatRooms(options);
    return chatRooms;
};
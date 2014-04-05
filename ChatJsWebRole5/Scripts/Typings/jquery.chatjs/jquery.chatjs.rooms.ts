interface JQueryStatic {
    chatRooms: (options: ChatRoomsOptions) => ChatRooms;
}

class ChatRoomsOptions {
    constructor() {
        this.titleText = "Rooms";
        this.noRoomsText = "There's no rooms";
    }

    titleText: string;
    adapter: IAdapter;
    noRoomsText: string;
    userClicked: (userId: number) => void;
    userId: number;
}

class ChatRooms {
    constructor(options: ChatRoomsOptions) {
        this.options = options;
    }

    init() {
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
                                    .attr("data-val-id", roomsList[i].id)
                                    .appendTo($content);

                                $roomListItem.hover(function () {
                                    $(this).addClass("hover");
                                }, function () {
                                        $(this).removeClass("hover");
                                    });

                                $("<span/>")
                                    .addClass("room-name")
                                    .text(roomsList[i].name)
                                    .appendTo($roomListItem);

                                $("<span/>")
                                    .addClass("users-online")
                                    .text(roomsList[i].usersOnline + " online")
                                    .appendTo($roomListItem);

                                $roomListItem.hover(function () {
                                    $(this).addClass("hover");
                                }, function () {
                                        $(this).removeClass("hover");
                                    });

                                (roomIndex => {
                                    $roomListItem.click(() => {
                                        if (this.tabs.hasTab(roomsList[roomIndex].id))
                                            this.tabs.focusTab(roomsList[roomIndex].id.toString());
                                        else
                                            this.enterRoom(roomsList[roomIndex].id, roomsList[roomIndex].name);
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
            messageBoardOptions.roomId = this.options.roomId;
            messageBoardOptions.newMessage = (message) => {
                var focusedTabId = this.tabs.getFucusedTabId();
                if (focusedTabId && focusedTabId != roomId && message.userFromId != this.options.userId)
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

    options: ChatRoomsOptions;
    chatWindow: ChatWindow;
    tabs: HorizontalTabs;
}

// The actual plugin
$.chatRooms = options => {
    var chatRooms = new ChatRooms(options);
    chatRooms.init();
    return chatRooms;
};
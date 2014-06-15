interface JQueryStatic {
    chatRooms: (options: ChatRoomsOptions) => ChatRooms;
}

class ChatRoomsOptions {
    titleText: string;
    adapter: IAdapter;
    noRoomsText: string;
    // available rooms title text
    availableRoomsText: string;
    userClicked: (userId: number) => void;
    // called whenever the rooms state changed (e.g, user entered a different room or focused a different room)
    onStateChanged: () => void;
    userId: number;
    offsetRight: number;
    contentHeight: number;
    isMaximized: boolean;
    chatJsContentPath: string;

}

// represents the current state of the ChatRooms.
class ChatRoomsState {
    // whether or not the rooms window is maximized
    isMaximized: boolean;
    // the ids of the currently opened rooms
    openedRooms: Array<number>;
    // the id of the currently selected room
    activeRoom: number;
}

// window that shows the rooms
class ChatRooms {
    constructor(options: ChatRoomsOptions) {

        var defaultOptions = new ChatRoomsOptions();
        defaultOptions.titleText = "Rooms";
        defaultOptions.noRoomsText = "There's no rooms";
        defaultOptions.availableRoomsText = "Available rooms";
        defaultOptions.userClicked = () => {};
        defaultOptions.onStateChanged = () => {};
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
        chatWindowOptions.onMaximizedStateChanged = () => {
            this.options.onStateChanged();
        };

        // function to build the available rooms content
        var availableRoomsTabBuilder = (roomList: Array<ChatRoomInfo>, $content) => {
            $content.html('');
            var $roomListWrapper = $("<div/>").addClass("rooms-list").appendTo($content);
            ChatJsUtils.setOuterHeight($roomListWrapper, this.options.contentHeight);
            if (roomList.length == 0) {
                $("<div/>").addClass("user-list-empty").text(this.options.noRoomsText).appendTo($roomListWrapper);
            } else {
                for (var i = 0; i < roomList.length; i++) {
                    var $roomListItem = $("<div/>")
                        .addClass("rooms-list-item")
                        .attr("data-val-id", roomList[i].Id)
                        .appendTo($roomListWrapper);

                    $roomListItem.hover(function() {
                        $(this).addClass("hover");
                    }, function() {
                        $(this).removeClass("hover");
                    });

                    $("<span/>")
                        .addClass("room-name")
                        .text(roomList[i].Name)
                        .appendTo($roomListItem);

                    $("<span/>")
                        .addClass("users-online")
                        .text(roomList[i].UsersOnline + " online")
                        .appendTo($roomListItem);

                    $roomListItem.hover(function() {
                        $(this).addClass("hover");
                    }, function() {
                        $(this).removeClass("hover");
                    });

                    (roomIndex => {
                        // this is what happens when you click a room
                        $roomListItem.click(() => {
                            if (this.tabs.hasTab(roomList[roomIndex].Id))
                                this.tabs.focusTab(roomList[roomIndex].Id);
                            else
                                this.enterRoom(roomList[roomIndex].Id, roomList[roomIndex].Name);
                            this.options.onStateChanged();
                        });
                    })(i);

                }
            }
        };

        chatWindowOptions.onCreated = window => {
            var $ul = $("<ul/>").appendTo(window.$windowInnerContent);

            var horizontalTabOptions = new HorizontalTabsOptions();
            horizontalTabOptions.onTabClosed = (id: number) => {
                this.options.adapter.server.leaveRoom(id, () => {});
            }

            this.tabs = $ul.horizontalTabs(horizontalTabOptions).data("horizontalTabs");

            // adds the available rooms tab
            this.tabs.addTab(0, this.options.availableRoomsText, true, false, ($content) => {
                this.options.adapter.server.getRoomsList((roomList: Array<ChatRoomInfo>) => {
                    availableRoomsTabBuilder(roomList, $content);
                });
            }, () => {
                this.options.onStateChanged();
            }, true, false);
        };

        // when the rooms change, the available rooms must be updated
        this.options.adapter.client.onRoomListChanged((roomList: ChatRoomListChangedInfo) => {
            var availableRoomsTab = this.tabs.getTab(0);
            availableRoomsTabBuilder(roomList.Rooms, availableRoomsTab.$content);
        });

        // will create user list chat container
        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }

    // enters the given room
    enterRoom(roomId: number, roomName: string, saveState: boolean = true): void {

        var $messageBoard;

        this.tabs.addTab(roomId, roomName, true, true, ($content) => {
            // constructs the tab content
            var $contentWrapper = $("<div/>").addClass("content-wrapper").appendTo($content);
            var $users = $("<div/>").addClass("right-panel").appendTo($contentWrapper);
            var $leftPanel = $("<div/>").addClass("left-panel").appendTo($contentWrapper);

            var messageBoardOptions = new MessageBoardOptions();
            messageBoardOptions.adapter = this.options.adapter;
            messageBoardOptions.userId = this.options.userId;
            messageBoardOptions.height = this.options.contentHeight;
            messageBoardOptions.roomId = roomId;
            messageBoardOptions.chatJsContentPath = this.options.chatJsContentPath;

            messageBoardOptions.newMessage = (message) => {
                var focusedTabId = this.tabs.getFucusedTabId();
                if (focusedTabId != null && focusedTabId != roomId && message.UserFromId != this.options.userId)
                    this.tabs.addEventMark(roomId);
            };
            $messageBoard = $leftPanel.messageBoard(messageBoardOptions);

            this.options.adapter.server.enterRoom(roomId, () => {
                // loads the user list

                var userListOptions = new UserListOptions();
                userListOptions.adapter = this.options.adapter;
                userListOptions.roomId = roomId;
                userListOptions.height = this.options.contentHeight;
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
            this.options.onStateChanged();
        }, saveState, saveState);
    }

    // returns the current Rooms state
    getState(): ChatRoomsState {
        var state = new ChatRoomsState();
        state.isMaximized = this.chatWindow.isMaximized();
        state.activeRoom = this.tabs.getFucusedTabId();
        state.openedRooms = this.tabs.getTabIds();
        return state;
    }

    // loads the given state
    setState(state: ChatRoomsState) {
        this.options.adapter.server.getRoomsList((roomsList: ChatRoomInfo[]) => {
            // for each of the rooms in the given state, we're gonna see if there's actually the given room in the server.
            // if such room exists and it's not opened already, we're gonna enter it.
            for (var i = 0; i < state.openedRooms.length; i++)
                if (!this.tabs.hasTab(state.openedRooms[i])) {
                    for (var j = 0; j < roomsList.length; j++) {
                        if (roomsList[j].Id == state.openedRooms[i]) {
                            this.enterRoom(roomsList[j].Id, roomsList[j].Name, false);
                            break;
                        }
                    }
                }

            // focus the room as stated in the state
            this.tabs.focusTab(state.activeRoom, false);

            // sets the maximized state
            this.chatWindow.setMaximized(state.isMaximized);
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
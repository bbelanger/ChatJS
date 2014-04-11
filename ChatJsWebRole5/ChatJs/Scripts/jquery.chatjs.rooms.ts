interface JQueryStatic {
    chatRooms: (options: ChatRoomsOptions) => ChatRooms;
}

class ChatRoomsOptions {
    titleText: string;
    adapter: IAdapter;
    noRoomsText: string;
    userClicked: (userId: number) => void;
    // called whenever the rooms state changed (e.g, user entered a different room or focused a different room)
    stateChanged: () => void;
    userId: number;
    offsetRight: number;
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

class ChatRooms {
    constructor(options: ChatRoomsOptions) {

        var defaultOptions = new ChatRoomsOptions();
        defaultOptions.titleText = "Rooms";
        defaultOptions.noRoomsText = "There's no rooms";
        defaultOptions.userClicked = () => {};
        defaultOptions.stateChanged = () => {};
        defaultOptions.offsetRight = 10;

        this.options = $.extend({}, defaultOptions, options);

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.titleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.canExpand = true;
        chatWindowOptions.width = 400;
        chatWindowOptions.height = 300;
        chatWindowOptions.onCreated = window => {
            var $ul = $("<ul/>").appendTo(window.$windowInnerContent);
            this.tabs = $ul.horizontalTabs().data("horizontalTabs");

            // adds the available rooms tab
            this.tabs.addTab(0, "Available rooms", true, false, ($content) => {
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

                            $roomListItem.hover(function() {
                                $(this).addClass("hover");
                            }, function() {
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

                            $roomListItem.hover(function() {
                                $(this).addClass("hover");
                            }, function() {
                                $(this).removeClass("hover");
                            });

                            (roomIndex => {
                                $roomListItem.click(() => {
                                    if (this.tabs.hasTab(roomsList[roomIndex].Id))
                                        this.tabs.focusTab(roomsList[roomIndex].Id);
                                    else
                                        this.enterRoom(roomsList[roomIndex].Id, roomsList[roomIndex].Name);
                                    this.options.stateChanged();
                                });
                            })(i);

                        }
                    }
                });
            }, () => {
                this.options.stateChanged();
            }, true, false);
        };


        // will create user list chat container
        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }

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
            messageBoardOptions.roomId = roomId;

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
            this.options.stateChanged();
        }, saveState, saveState);
    }

    // returns the current Rooms state
    getState(): ChatRoomsState {
        var state = new ChatRoomsState();
        state.isMaximized = true; // TODO: fix it
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

            //TODO: take the isMaximized into account
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
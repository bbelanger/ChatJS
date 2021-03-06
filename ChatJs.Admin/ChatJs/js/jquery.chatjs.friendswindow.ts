﻿interface JQueryStatic {
    chatFriendsWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class ChatFriendsWindowState {
    isMaximized: boolean;
}

class ChatFriendsWindowOptions {
    adapter: IAdapter;
    // the title for the friend list
    friendListTitleText: string;
    // room id
    roomId: number;
    // content height
    contentHeight: number;
    // what happens when the user clicks a friend
    userClicked: (userId: number) => void;
    // whether or not this window is maximized
    isMaximized: boolean;
    // called when the user minimizes or maximizes the window
    onMaximizedStateChanged: (isMaximized: boolean) => void;
}

// window that contains a list of friends. This component is used as opposed to "jquery.chatjs.rooms". The "rooms" component
// should be used when the user has the ability to select rooms and broadcast them. The "friends window" is used when you want a 
// Facebook style friends list.
class ChatFriendsWindow implements IWindow<ChatFriendsWindowState> {
    constructor(options: ChatPmWindowOptions) {

        var defaultOptions = new ChatFriendsWindowOptions();
        defaultOptions.friendListTitleText = "Friends";
        defaultOptions.isMaximized = true;

        this.options = $.extend({}, defaultOptions, options);

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.friendListTitleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.canExpand = true;
        chatWindowOptions.width = 400;
        chatWindowOptions.height = 300;
        chatWindowOptions.isMaximized = this.options.isMaximized;

        chatWindowOptions.onMaximizedStateChanged = (chatWindow: ChatWindow, isMaximized: boolean) => {
            this.options.onMaximizedStateChanged(isMaximized);
        };

        chatWindowOptions.onCreated = window => {
            var userListOptions = new UserListOptions();
            userListOptions.adapter = this.options.adapter;
            userListOptions.roomId = this.options.roomId;
            userListOptions.height = this.options.contentHeight;
            userListOptions.userClicked = this.options.userClicked;

            window.$windowInnerContent.userList(userListOptions);
        };

        this.chatWindow = $.chatWindow(chatWindowOptions);

    }

    focus() {
    }

    setRightOffset(offset: number): void {
        this.chatWindow.setRightOffset(offset);
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    getState(): ChatFriendsWindowState {
        var state = new ChatFriendsWindowState();
        state.isMaximized = this.chatWindow.getState();
        return state;
    }

    setState(state: ChatFriendsWindowState) {
        this.chatWindow.setState(state.isMaximized);
    }

    options: ChatFriendsWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
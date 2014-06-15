interface JQueryStatic {
    chatFriendsWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class ChatFriendsWindowOptions {
    adapter: IAdapter;
    // room id
    roomId: number;
    // content height
    contentHeight: number;
    // what happens when the user clicks a friend
    userClicked: (userId: number) => void;
}

// window that contains a list of friends. This component is used as opposed to "jquery.chatjs.rooms". The "rooms" component
// should be used when the user has the ability to select rooms and broadcast them. The "friends window" is used when you want a 
// Facebook style friends list.
class ChatFriendsWindow {
    constructor(options: ChatPmWindowOptions) {

        var defaultOptions = new ChatFriendsWindowOptions();

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

        var userListOptions = new UserListOptions();
        userListOptions.adapter = this.options.adapter;
        userListOptions.roomId = this.options.roomId;
        userListOptions.height = this.options.contentHeight;
        userListOptions.userClicked = this.options.userClicked;

        $users.userList(userListOptions);
    }

    focus() {
    }

    setRightOffset(offset: number): void {
        this.chatWindow.setRightOffset(offset);
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    isMaximized(): boolean {
        return this.chatWindow.isMaximized();
    }

    options: ChatFriendsWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
var ChatFriendsWindowState = (function () {
    function ChatFriendsWindowState() {
    }
    return ChatFriendsWindowState;
})();

var ChatFriendsWindowOptions = (function () {
    function ChatFriendsWindowOptions() {
    }
    return ChatFriendsWindowOptions;
})();

// window that contains a list of friends. This component is used as opposed to "jquery.chatjs.rooms". The "rooms" component
// should be used when the user has the ability to select rooms and broadcast them. The "friends window" is used when you want a
// Facebook style friends list.
var ChatFriendsWindow = (function () {
    function ChatFriendsWindow(options) {
        var _this = this;
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

        chatWindowOptions.onMaximizedStateChanged = function (chatWindow, isMaximized) {
            _this.options.onMaximizedStateChanged(isMaximized);
        };

        chatWindowOptions.onCreated = function (window) {
            var userListOptions = new UserListOptions();
            userListOptions.adapter = _this.options.adapter;
            userListOptions.roomId = _this.options.roomId;
            userListOptions.height = _this.options.contentHeight;
            userListOptions.userClicked = _this.options.userClicked;

            window.$windowInnerContent.userList(userListOptions);
        };

        this.chatWindow = $.chatWindow(chatWindowOptions);
    }
    ChatFriendsWindow.prototype.focus = function () {
    };

    ChatFriendsWindow.prototype.setRightOffset = function (offset) {
        this.chatWindow.setRightOffset(offset);
    };

    ChatFriendsWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    ChatFriendsWindow.prototype.getState = function () {
        var state = new ChatFriendsWindowState();
        state.isMaximized = this.chatWindow.getState();
        return state;
    };

    ChatFriendsWindow.prototype.setState = function (state) {
        this.chatWindow.setState(state.isMaximized);
    };
    return ChatFriendsWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.friendswindow.js.map

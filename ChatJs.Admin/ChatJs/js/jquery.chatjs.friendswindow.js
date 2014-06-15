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

        var userListOptions = new UserListOptions();
        userListOptions.adapter = this.options.adapter;
        userListOptions.roomId = this.options.roomId;
        userListOptions.height = this.options.contentHeight;
        userListOptions.userClicked = this.options.userClicked;

        $users.userList(userListOptions);
    }
    ChatFriendsWindow.prototype.focus = function () {
    };

    ChatFriendsWindow.prototype.setRightOffset = function (offset) {
        this.chatWindow.setRightOffset(offset);
    };

    ChatFriendsWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    ChatFriendsWindow.prototype.isMaximized = function () {
        return this.chatWindow.isMaximized();
    };
    return ChatFriendsWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.friendswindow.js.map

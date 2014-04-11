var ChatPmWindowOptions = (function () {
    function ChatPmWindowOptions() {
    }
    return ChatPmWindowOptions;
})();

var ChatPmWindow = (function () {
    function ChatPmWindow(options) {
        var _this = this;
        var defaultOptions = new ChatPmWindowOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.isMaximized = true;
        defaultOptions.onCreated = function () {
        };
        defaultOptions.onClose = function () {
        };

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.getUserInfo(this.options.otherUserId, function (userInfo) {
            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.Name;
            chatWindowOptions.canClose = true;
            chatWindowOptions.canExpand = false;
            chatWindowOptions.isMaximized = _this.options.isMaximized;
            chatWindowOptions.onCreated = function (window) {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = _this.options.adapter;
                messageBoardOptions.userId = _this.options.userId;
                messageBoardOptions.otherUserId = _this.options.otherUserId;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
            };
            chatWindowOptions.onClose = function () {
                _this.options.onClose(_this);
            };
            chatWindowOptions.onMaximizedStateChanged = function (chatPmWindow, isMaximized) {
                _this.options.onMaximizedStateChanged(_this, isMaximized);
            };
            _this.chatWindow = $.chatWindow(chatWindowOptions);
            _this.options.onCreated(_this);
        });
    }
    ChatPmWindow.prototype.focus = function () {
    };

    ChatPmWindow.prototype.setRightOffset = function (offset) {
        this.chatWindow.setRightOffset(offset);
    };

    ChatPmWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    ChatPmWindow.prototype.isMaximized = function () {
        return this.chatWindow.isMaximized();
    };
    return ChatPmWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.pmwindow.js.map

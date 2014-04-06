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
            chatWindowOptions.onCreated = function (window) {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = _this.options.adapter;
                messageBoardOptions.userId = _this.options.userId;
                messageBoardOptions.otherUserId = _this.options.otherUserId;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
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
    return ChatPmWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.pmwindow.js.map

var ChatPmWindowOptions = (function () {
    function ChatPmWindowOptions() {
        this.typingText = " is typing...";
        this.onClose = function () {
        };
    }
    return ChatPmWindowOptions;
})();

var ChatPmWindow = (function () {
    function ChatPmWindow(options) {
        this.options = options;
    }
    ChatPmWindow.prototype.init = function () {
        var _this = this;
        this.options.adapter.server.getUserInfo(this.options.otherUserId, function (userInfo) {
            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.name;
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
        });
    };
    return ChatPmWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    pmWindow.init();
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.pmwindow.js.map

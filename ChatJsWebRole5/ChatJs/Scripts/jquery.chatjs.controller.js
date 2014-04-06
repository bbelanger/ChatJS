var ChatControllerOptions = (function () {
    function ChatControllerOptions() {
    }
    return ChatControllerOptions;
})();

var PmWindowInfo = (function () {
    function PmWindowInfo() {
    }
    return PmWindowInfo;
})();

var ChatController = (function () {
    function ChatController(options) {
        var _this = this;
        var defaultOptions = new ChatControllerOptions();
        defaultOptions.emptyRoomText = "There's no other users";
        defaultOptions.typingText = " is typing...";
        defaultOptions.allowRoomSelection = true;
        defaultOptions.offsetRight = 10;
        defaultOptions.windowsSpacing = 2;
        defaultOptions.enableSound = true;

        this.options = $.extend({}, defaultOptions, options);

        this.pmWindows = [];

        // getting the adapter started. You cannot call the adapter BEFORE this is done.
        this.options.adapter.init(function () {
            // the controller must have a listener to the "messages-changed" event because it has to create
            // new PM windows when the user receives it
            _this.options.adapter.client.onMessagesChanged(function (message) {
                if (message.UserToId && message.UserToId == _this.options.userId && !_this.findPmWindowByOtherUserId(message.UserFromId)) {
                    var chatPmOptions = new ChatPmWindowOptions();
                    chatPmOptions.userId = _this.options.userId;
                    chatPmOptions.otherUserId = message.UserFromId;
                    chatPmOptions.adapter = _this.options.adapter;
                    chatPmOptions.typingText = _this.options.typingText;
                    chatPmOptions.onCreated = function () {
                        _this.organizePmWindows();
                    };

                    _this.pmWindows.push({
                        otherUserId: message.UserFromId,
                        conversationId: null,
                        pmWindow: $.chatPmWindow(chatPmOptions)
                    });
                }
            });

            var chatRoomOptions = new ChatRoomsOptions();
            chatRoomOptions.adapter = _this.options.adapter;
            chatRoomOptions.userId = _this.options.userId;
            chatRoomOptions.offsetRight = _this.options.offsetRight;
            chatRoomOptions.userClicked = function (userId) {
                if (userId != _this.options.userId) {
                    // verify whether there's already a PM window for this user
                    var existingPmWindow = _this.findPmWindowByOtherUserId(userId);
                    if (existingPmWindow)
                        existingPmWindow.focus();
                    else {
                        var chatPmOptions = new ChatPmWindowOptions();
                        chatPmOptions.userId = _this.options.userId;
                        chatPmOptions.otherUserId = userId;
                        chatPmOptions.adapter = _this.options.adapter;
                        chatPmOptions.typingText = _this.options.typingText;
                        chatPmOptions.onCreated = function () {
                            _this.organizePmWindows();
                        };

                        _this.pmWindows.push({
                            otherUserId: userId,
                            conversationId: null,
                            pmWindow: $.chatPmWindow(chatPmOptions)
                        });
                    }
                }
            };
            _this.chatRooms = $.chatRooms(chatRoomOptions);
        });
    }
    ChatController.prototype.eraseCookie = function (name) {
        this.createCookie(name, "", -1);
    };

    ChatController.prototype.readCookie = function (name) {
        var nameEq = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEq) == 0)
                return c.substring(nameEq.length, c.length);
        }
        return null;
    };

    ChatController.prototype.createCookie = function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    ChatController.prototype.organizeWindows = function () {
    };

    ChatController.prototype.findPmWindowByOtherUserId = function (otherUserId) {
        for (var i = 0; i < this.pmWindows.length; i++)
            if (this.pmWindows[i].otherUserId == otherUserId)
                return this.pmWindows[i].pmWindow;
        return null;
    };

    ChatController.prototype.organizePmWindows = function () {
        // this is the initial right offset
        var rightOffset = +this.options.offsetRight + this.chatRooms.getWidth() + this.options.windowsSpacing;
        for (var i = 0; i < this.pmWindows.length; i++) {
            this.pmWindows[i].pmWindow.setRightOffset(rightOffset);
            rightOffset += this.pmWindows[i].pmWindow.getWidth() + this.options.windowsSpacing;
        }
    };
    return ChatController;
})();

$.chat = function (options) {
    var chat = new ChatController(options);
    return chat;
};
//# sourceMappingURL=jquery.chatjs.controller.js.map

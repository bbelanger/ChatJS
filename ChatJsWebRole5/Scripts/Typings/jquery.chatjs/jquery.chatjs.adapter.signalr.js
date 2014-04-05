var SignalRServerAdapter = (function () {
    function SignalRServerAdapter(chatHubServer) {
        this.hubServer = chatHubServer;
    }
    // sends a message to a room, conversation or user
    SignalRServerAdapter.prototype.sendMessage = function (roomId, conversationId, otherUserId, messageText, clientGuid, done) {
        this.hubServer.sendMessage(roomId, conversationId, otherUserId, messageText, clientGuid).done(function () {
            done();
        });
    };

    // sends a typing signal to a room, conversation or user
    SignalRServerAdapter.prototype.sendTypingSignal = function (roomId, conversationId, userToId, done) {
        this.hubServer.sendTypingSignal(roomId, conversationId, userToId).done(function () {
            done();
        });
    };

    // gets the message history from a room, conversation or user
    SignalRServerAdapter.prototype.getMessageHistory = function (roomId, conversationId, otherUserId, done) {
        this.hubServer.getMessageHistory(roomId, conversationId, otherUserId).done(function (messageHistory) {
            done(messageHistory);
        });
    };

    // gets the given user info
    SignalRServerAdapter.prototype.getUserInfo = function (userId, done) {
        this.hubServer.getUserInfo(userId).done(function (userInfo) {
            done(userInfo);
        });
    };

    // gets the user list in a room or conversation
    SignalRServerAdapter.prototype.getUserList = function (roomId, conversationId, done) {
        this.hubServer.getUserList(roomId, conversationId).done(function (userList) {
            done(userList);
        });
    };

    // gets the rooms list
    SignalRServerAdapter.prototype.getRoomsList = function (done) {
        this.hubServer.getRoomsList().done(function (roomsList) {
            done(roomsList);
        });
    };

    // enters the given room
    SignalRServerAdapter.prototype.enterRoom = function (roomId, done) {
        this.hubServer.enterRoom(roomId).done(function () {
            done();
        });
    };

    // leaves the given room
    SignalRServerAdapter.prototype.leaveRoom = function (roomId, done) {
        this.hubServer.leaveRoom(roomId).done(function () {
            done();
        });
    };
    return SignalRServerAdapter;
})();

var SignalRClientAdapter = (function () {
    function SignalRClientAdapter(chatHubClient) {
        var _this = this;
        this.messagesChangedHandlers = [];
        this.typingSignalReceivedHandlers = [];
        this.userListChangedHandlers = [];
        this.hubClient = chatHubClient;

        this.hubClient.sendMessage = function (message) {
            for (var i = 0; i < _this.messagesChangedHandlers.length; i++)
                _this.messagesChangedHandlers[i](message);
        };

        this.hubClient.sendTypingSignal = function (typingSignal) {
            for (var i = 0; i < _this.typingSignalReceivedHandlers.length; i++)
                _this.typingSignalReceivedHandlers[i](typingSignal);
        };

        this.hubClient.userListChanged = function (userListChangedInfo) {
            for (var i = 0; i < _this.typingSignalReceivedHandlers.length; i++)
                _this.userListChangedHandlers[i](userListChangedInfo);
        };
    }
    // called by the server when a new message has arrived
    SignalRClientAdapter.prototype.onMessagesChanged = function (handler) {
        this.messagesChangedHandlers.push(handler);
    };

    // called by the server when a user is typing
    SignalRClientAdapter.prototype.onTypingSignalReceived = function (handler) {
        this.typingSignalReceivedHandlers.push(handler);
    };

    // called by the server when the user list changed
    SignalRClientAdapter.prototype.onUserListChanged = function (handler) {
        this.userListChangedHandlers.push(handler);
    };
    return SignalRClientAdapter;
})();

var SignalRAdapter = (function () {
    function SignalRAdapter() {
    }
    SignalRAdapter.prototype.init = function (chat, done) {
        this.hub = $.connection.chatHub;
        this.client = new SignalRClientAdapter(this.hub.client);
        this.server = new SignalRServerAdapter(this.hub.server);

        if (!window.chatJsHubReady)
            window.chatJsHubReady = $.connection.hub.start();

        window.chatJsHubReady.done(function () {
            // function passed by ChatJS to the adapter to be called when the adapter initialization is completed
            done();
        });
    };
    return SignalRAdapter;
})();
//# sourceMappingURL=jquery.chatjs.adapter.signalr.js.map

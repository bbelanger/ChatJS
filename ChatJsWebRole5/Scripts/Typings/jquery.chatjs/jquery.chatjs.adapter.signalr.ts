interface IChatJsHubProxyClient {
    sendMessage: (message: ChatMessageInfo) => void;
    sendTypingSignal: (typingSignal: ChatTypingSignalInfo) => void;
    userListChanged: (userListChangedInfo: ChatUserListChangedInfo) => void
}

interface IChatJsHubProxyServer {
    sendMessage: (roomId: number, conversationId: number, otherUserId: number, messageText: string, clientGuid: string) => JQueryPromise<any>;
    sendTypingSignal: (roomId: number, conversationId: number, userToId: number) => JQueryPromise<any>;
    getMessageHistory: (roomId: number, conversationId: number, otherUserId: number) => JQueryPromise<any>;
    getUserInfo: (userId: number) => JQueryPromise<any>;
    getUserList: (roomId: number, conversationId: number) => JQueryPromise<any>;
    enterRoom: (roomId: number) => JQueryPromise<any>;
    leaveRoom: (roomId: number) => JQueryPromise<any>;
    getRoomsList(): JQueryPromise<any>;
}

interface IChatJsHubProxy {
    client: IChatJsHubProxyClient;
    server: IChatJsHubProxyServer;
}

interface SignalR {
    chatHub: IChatJsHubProxy;
}

interface Window {
    chatJsHubReady: JQueryPromise<any>;
}


class SignalRServerAdapter implements IServerAdapter {

    constructor(chatHubServer: IChatJsHubProxyServer) {
        this.hubServer = chatHubServer;
    }

    // sends a message to a room, conversation or user
    sendMessage(roomId: number, conversationId: number, otherUserId: number, messageText: string, clientGuid: string, done: () => void): void {
        this.hubServer.sendMessage(roomId, conversationId, otherUserId, messageText, clientGuid).done(() => {
            done();
        });
    }

    // sends a typing signal to a room, conversation or user
    sendTypingSignal(roomId: number, conversationId: number, userToId: number, done: () => void): void {
        this.hubServer.sendTypingSignal(roomId, conversationId, userToId).done(() => {
            done();
        });
    }

    // gets the message history from a room, conversation or user
    getMessageHistory(roomId: number, conversationId: number, otherUserId: number, done: (messages: Array<ChatMessageInfo>) => void): void {
        this.hubServer.getMessageHistory(roomId, conversationId, otherUserId).done((messageHistory: Array<ChatMessageInfo>) => {
            done(messageHistory);
        });
    }

    // gets the given user info
    getUserInfo(userId: number, done: (userInfo: ChatUserInfo) => void): void {
        this.hubServer.getUserInfo(userId).done((userInfo: ChatUserInfo) => {
            done(userInfo);
        });
    }

    // gets the user list in a room or conversation
    getUserList(roomId: number, conversationId: number, done: (userList: Array<ChatUserInfo>) => void): void {
        this.hubServer.getUserList(roomId, conversationId).done((userList: Array<ChatUserInfo>) => {
            done(userList);
        });
    }

    // gets the rooms list
    getRoomsList(done: (roomsList: Array<ChatRoomInfo>) => void) {
        this.hubServer.getRoomsList().done((roomsList: Array<ChatRoomInfo>) => {
            done(roomsList);
        });
    }

    // enters the given room
    enterRoom(roomId: number, done: () => void) {
        this.hubServer.enterRoom(roomId).done(() => {
            done();
        });
    }

    // leaves the given room
    leaveRoom(roomId: number, done: () => void) {
        this.hubServer.leaveRoom(roomId).done(() => {
            done();
        });
    }

    hubServer: IChatJsHubProxyServer;
}

class SignalRClientAdapter implements IClientAdapter {

    constructor(chatHubClient: IChatJsHubProxyClient) {
        this.messagesChangedHandlers = [];
        this.typingSignalReceivedHandlers = [];
        this.userListChangedHandlers = [];
        this.hubClient = chatHubClient;

        this.hubClient.sendMessage = (message: ChatMessageInfo) => {
            for (var i = 0; i < this.messagesChangedHandlers.length; i++)
                this.messagesChangedHandlers[i](message);
        };

        this.hubClient.sendTypingSignal = (typingSignal: ChatTypingSignalInfo) => {
            for (var i = 0; i < this.typingSignalReceivedHandlers.length; i++)
                this.typingSignalReceivedHandlers[i](typingSignal);
        };

        this.hubClient.userListChanged = (userListChangedInfo: ChatUserListChangedInfo) => {
            for (var i = 0; i < this.typingSignalReceivedHandlers.length; i++)
                this.userListChangedHandlers[i](userListChangedInfo);
        };
    }

    // called by the server when a new message has arrived
    onMessagesChanged(handler: (message: ChatMessageInfo) => void): void {
        this.messagesChangedHandlers.push(handler);
    }

    // called by the server when a user is typing
    onTypingSignalReceived(handler: (typingSignal: ChatTypingSignalInfo) => void): void {
        this.typingSignalReceivedHandlers.push(handler);
    }

    // called by the server when the user list changed
    onUserListChanged(handler: (userListData: ChatUserListChangedInfo) => void): void {
        this.userListChangedHandlers.push(handler);
    }

    messagesChangedHandlers: Array<(message: ChatMessageInfo) => void>;
    typingSignalReceivedHandlers: Array<(typingSignal: ChatTypingSignalInfo) => void>;
    userListChangedHandlers: Array<(userListData: ChatUserListChangedInfo) => void>;
    hubClient: IChatJsHubProxyClient;
}

class SignalRAdapter implements IAdapter {

    init(chat: any, done: () => void) {
        this.hub = $.connection.chatHub;
        this.client = new SignalRClientAdapter(this.hub.client);
        this.server = new SignalRServerAdapter(this.hub.server);

        if (!window.chatJsHubReady)
            window.chatJsHubReady = $.connection.hub.start();

        window.chatJsHubReady.done(() => {
            // function passed by ChatJS to the adapter to be called when the adapter initialization is completed
            done();
        });
    }

    // functions called by the server, to contact the client
    client: IClientAdapter;

    // functions called by the client, to contact the server
    server: IServerAdapter;
    hub: IChatJsHubProxy;
}
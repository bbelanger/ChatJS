interface IServerAdapter {

    // sends a message to a room, conversation or user
    sendMessage(roomId: number, conversationId: number, otherUserId: number, messageText: string, clientGuid: string, done: () => void): void;

    // sends a typing signal to a room, conversation or user
    sendTypingSignal(roomId: number, conversationId: number, userToId: number, done: () => void): void;

    // gets the message history from a room, conversation or user
    getMessageHistory(roomId: number, conversationId: number, otherUserId: number, done: (messages: Array<ChatMessageInfo>) => void): void;

    // gets the given user info
    getUserInfo(userId: number, done: (userInfo: ChatUserInfo) => void): void;

    // gets the user list in a room or conversation
    getUserList(roomId: number, conversationId: number, done: (userList: Array<ChatUserInfo>) => void): void;

    getRoomsList(done: (roomsList: Array<ChatRoomInfo>) => void): void;

    // enters the given room
    enterRoom(roomId: number, done: () => void): void;

    // leaves the given room
    leaveRoom(roomId: number, done: () => void): void;
}

interface IClientAdapter {

    // called by the server when a new message has arrived
    onMessagesChanged(handler: (message: ChatMessageInfo) => void): void;

    // called by the server when a user is typing
    onTypingSignalReceived(handler: (typingSignal: ChatTypingSignalInfo) => void): void;

    // called by the server when the user list changed
    onUserListChanged(handler: (userListData: ChatUserListChangedInfo) => void): void;

    // called by the server when the room list changed
    onRoomListChanged(handler: (roomListData: ChatRoomListChangedInfo) => void): void;
}

interface IAdapter {

    init: (done: () => void) => void;

    // functions called by the server, to contact the client
    client: IClientAdapter;

    // functions called by the client, to contact the server
    server: IServerAdapter;
}
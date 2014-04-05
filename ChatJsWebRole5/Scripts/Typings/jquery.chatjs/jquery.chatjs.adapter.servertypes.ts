class ChatMessageInfo {
    /// The user that sent the message
    userFromId: number;

    /// The user to whom the message is to
    userToId: number;

    /// The conversation to which the message is being sent
    conversationId: number;

    /// The room to which the message is being sent
    roomId: number;

    /// <summary>
    /// Message timestamp
    /// </summary>
    timestamp: number;

    /// <summary>
    /// Message text
    /// </summary>
    message: string;

    /// Client GUID
    clientGuid: string

    /// Still verifying whether this is necessary
    dateTime: Date
}

enum UserStatusType {
    Offline = 0,
    Online = 1
}

/// <summary>
/// Information about a chat user
/// </summary>
class ChatUserInfo {
    /// User chat status. For now, it only supports online and offline
    constructor() {

    }

    /// User Id (preferebly the same as database user Id)
    id: number;

    /// User display name
    name: string;

    /// Profile Url
    url: string

    /// User profile picture URL (Gravatar, for instance)
    profilePictureUrl: string

    /// User's status
    status: UserStatusType;

    /// Last time this user has been active
    lastActiveOn: Date;

    /// User e-mail
    email: string;

    /// User room id
    roomId: number
}

class ChatRoomInfo {
    /// The room id
    id: number

    /// The room display name
    name: string

    /// Number of online users right now
    usersOnline: number;
}

class ChatTypingSignalInfo {

    // room to send the typing signal to
    roomId: number;

    // conversation to send the typing signal to
    conversationId: number;

    // user to send the typing signal to
    userToId: number;

    // user that originated the typing signal
    userFrom: ChatUserInfo;
}

class ChatUserListChangedInfo {
    
    // room from which the users changed
    roomId: number;

    // conversation from which the users changed
    conversationId: number;

    // list of users
    userList : Array<ChatUserInfo>;
}
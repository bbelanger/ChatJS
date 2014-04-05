interface JQueryStatic {
    chatPmWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class ChatPmWindowOptions {
    constructor() {
        this.typingText = " is typing...";
        this.onClose = () => {};
    }

    userId: number;
    otherUserId: number;
    conversationId: number;
    typingText: string;
    adapter: IAdapter;
    onClose: () => void;
}

class ChatPmWindow {
    constructor(options: ChatPmWindowOptions) {
        this.options = options;
    }

    init() {
        this.options.adapter.server.getUserInfo(this.options.otherUserId, (userInfo: ChatUserInfo) => {

            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.name;
            chatWindowOptions.canClose = true;
            chatWindowOptions.canExpand = false;
            chatWindowOptions.onCreated = (window: ChatWindow) => {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = this.options.adapter;
                messageBoardOptions.userId = this.options.userId;
                messageBoardOptions.otherUserId = this.options.otherUserId;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
            }

            this.chatWindow = $.chatWindow(chatWindowOptions);
        });
    }

    options: ChatPmWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    pmWindow.init();
    return pmWindow;
};
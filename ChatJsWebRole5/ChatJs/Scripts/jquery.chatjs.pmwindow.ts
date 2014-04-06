interface JQueryStatic {
    chatPmWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class ChatPmWindowOptions {
    userId: number;
    otherUserId: number;
    conversationId: number;
    typingText: string;
    adapter: IAdapter;
    onCreated: (pmWindow: ChatPmWindow) => void;
    onClose: () => void;
}

class ChatPmWindow {
    constructor(options: ChatPmWindowOptions) {

        var defaultOptions = new ChatPmWindowOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.onCreated = () => { };
        defaultOptions.onClose = () => { };

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.getUserInfo(this.options.otherUserId, (userInfo: ChatUserInfo) => {

            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.Name;
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
            this.options.onCreated(this);
        });
    }

    focus() {
    }

    setRightOffset(offset: number): void {
        this.chatWindow.setRightOffset(offset);
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    options: ChatPmWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
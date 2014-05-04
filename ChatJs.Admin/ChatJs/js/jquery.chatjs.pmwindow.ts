interface JQueryStatic {
    chatPmWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class ChatPmWindowOptions {
    userId: number;
    otherUserId: number;
    conversationId: number;
    typingText: string;
    adapter: IAdapter;
    isMaximized: boolean;
    onCreated: (pmWindow: ChatPmWindow) => void;
    onClose: (pmWindow: ChatPmWindow) => void;
    onMaximizedStateChanged: (pmWindow: ChatPmWindow, isMaximized: boolean) => void;
    chatJsContentPath: string;
}

class ChatPmWindow {
    constructor(options: ChatPmWindowOptions) {

        var defaultOptions = new ChatPmWindowOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.isMaximized = true;
        defaultOptions.onCreated = () => {};
        defaultOptions.onClose = () => { };
        defaultOptions.chatJsContentPath = "/content/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.getUserInfo(this.options.otherUserId, (userInfo: ChatUserInfo) => {

            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.Name;
            chatWindowOptions.canClose = true;
            chatWindowOptions.canExpand = false;
            chatWindowOptions.isMaximized = this.options.isMaximized;
            chatWindowOptions.onCreated = (window: ChatWindow) => {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = this.options.adapter;
                messageBoardOptions.userId = this.options.userId;
                messageBoardOptions.height = 235;
                messageBoardOptions.otherUserId = this.options.otherUserId;
                messageBoardOptions.chatJsContentPath = this.options.chatJsContentPath;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
                window.$windowInnerContent.addClass("pm-window");
            };
            chatWindowOptions.onClose = () => {
                this.options.onClose(this);
            }
            chatWindowOptions.onMaximizedStateChanged = (chatPmWindow, isMaximized) => {
                this.options.onMaximizedStateChanged(this, isMaximized);
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

    isMaximized(): boolean {
        return this.chatWindow.isMaximized();
    }

    options: ChatPmWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
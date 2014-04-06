interface JQueryStatic {
    chat: (options: ChatControllerOptions) => ChatController;
}

class ChatControllerOptions {
    userId: number;
    adapter: IAdapter;
    emptyRoomText: string;
    typingText: string;
    allowRoomSelection: boolean;
    roomId: number;
    enableSound: boolean;
    // offset in the right for all windows in pixels. All windows will start at this offset from the right.
    offsetRight: number;
    // spacing between windows in pixels.
    windowsSpacing: number;
}

class PmWindowInfo {
    otherUserId: number;
    conversationId: number;
    pmWindow: ChatPmWindow;
}

class ChatController {
    constructor(options: ChatControllerOptions) {

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
        this.options.adapter.init(() => {
            // the controller must have a listener to the "messages-changed" event because it has to create
            // new PM windows when the user receives it
            this.options.adapter.client.onMessagesChanged((message: ChatMessageInfo) => {
                if (message.UserToId && message.UserToId == this.options.userId && !this.findPmWindowByOtherUserId(message.UserFromId)) {

                    var chatPmOptions = new ChatPmWindowOptions();
                    chatPmOptions.userId = this.options.userId;
                    chatPmOptions.otherUserId = message.UserFromId;
                    chatPmOptions.adapter = this.options.adapter;
                    chatPmOptions.typingText = this.options.typingText;
                    chatPmOptions.onCreated = () => {
                        this.organizePmWindows();
                    }

                    this.pmWindows.push({
                        otherUserId: message.UserFromId,
                        conversationId: null,
                        pmWindow: $.chatPmWindow(chatPmOptions)
                    });
                }
            });

            var chatRoomOptions = new ChatRoomsOptions();
            chatRoomOptions.adapter = this.options.adapter;
            chatRoomOptions.userId = this.options.userId;
            chatRoomOptions.userClicked = userId => {
                if (userId != this.options.userId) {
                    // verify whether there's already a PM window for this user
                    var existingPmWindow = this.findPmWindowByOtherUserId(userId);
                    if (existingPmWindow)
                        existingPmWindow.focus();
                    else {
                        var chatPmOptions = new ChatPmWindowOptions();
                        chatPmOptions.userId = this.options.userId;
                        chatPmOptions.otherUserId = userId;
                        chatPmOptions.adapter = this.options.adapter;
                        chatPmOptions.typingText = this.options.typingText;
                        chatPmOptions.onCreated = () => {
                            this.organizePmWindows();
                        }

                        this.pmWindows.push({
                            otherUserId: userId,
                            conversationId: null,
                            pmWindow: $.chatPmWindow(chatPmOptions)
                        });
                    }
                }
            };
            this.chatRooms = $.chatRooms(chatRoomOptions);
        });
    }

    eraseCookie(name) {
        this.createCookie(name, "", -1);
    }

    readCookie(name) {
        var nameEq = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
        }
        return null;
    }

    createCookie(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    organizeWindows() {

    }

    private findPmWindowByOtherUserId(otherUserId: number): ChatPmWindow {
        for (var i = 0; i < this.pmWindows.length; i++)
            if (this.pmWindows[i].otherUserId == otherUserId)
                return this.pmWindows[i].pmWindow;
        return null;
    }

    private organizePmWindows() {
        // this is the initial right offset
        var rightOffset = + this.options.offsetRight + this.chatRooms.getWidth() + this.options.windowsSpacing;
        for (var i = 0; i < this.pmWindows.length; i++) {
            this.pmWindows[i].pmWindow.setRightOffset(rightOffset);
            rightOffset += this.pmWindows[i].pmWindow.getWidth() + this.options.windowsSpacing;
        }
    }

    options: ChatControllerOptions;
    chatRooms: ChatRooms;
    pmWindows: Array<PmWindowInfo>;
}

$.chat = options => {
    var chat = new ChatController(options);
    return chat;
};
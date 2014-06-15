// Documentation: http://www.chatjs.net/Docs/options/jquery.chatjs.controller.html

// Extends the jQuery static object ($.something..) to have ChatJS
interface JQueryStatic {
    chat: (options: ChatControllerOptions) => ChatController;
}

// Extends the "this.window" object to have ChatJS
interface Window {
    // will hold the ChatJS controller. This is for debugging only
    chatJs: ChatController;
}

class ChatControllerOptions {
    userId: number;
    adapter: IAdapter;
    // empty room text
    emptyRoomText: string;
    // available rooms text
    availableRoomsText: string;
    // rooms window title
    roomsTitleText: string;
    typingText: string;
    allowRoomSelection: boolean;
    roomId: number;
    enableSound: boolean;
    // offset in the right for all windows in pixels. All windows will start at this offset from the right.
    offsetRight: number;
    // spacing between windows in pixels.
    windowsSpacing: number;
    // how the chat state is going to be persisted. Allowed values are: "cookie" and "server". //TODO: only "cookie" is currently implemented
    persistenceMode: string;
    // if persistenceMode is set to "cookie" (default), this is the cookie name
    persistenceCookieName: string;
    chatJsContentPath: string;
}

class PmWindowInfo {
    otherUserId: number;
    conversationId: number;
    pmWindow: ChatPmWindow;
}

class PmWindowState {
    otherUserId: number;
    conversationId: number;
    isMaximized: boolean;
}

class ChatJsState {
    constructor() {
        this.pmWindows = [];
        this.rooms = new ChatRoomsState();
    }

    pmWindows: Array<PmWindowState>;
    rooms: ChatRoomsState;
}

class ChatController {
    constructor(options: ChatControllerOptions) {

        var defaultOptions = new ChatControllerOptions();
        defaultOptions.roomsTitleText = "Rooms";
        defaultOptions.emptyRoomText = "There's no other users";
        defaultOptions.availableRoomsText = "Available rooms";
        defaultOptions.typingText = " is typing...";
        defaultOptions.allowRoomSelection = true;
        defaultOptions.offsetRight = 10;
        defaultOptions.windowsSpacing = 2;
        defaultOptions.enableSound = true;
        defaultOptions.persistenceMode = "cookie";
        defaultOptions.persistenceCookieName = "chatjs";
        defaultOptions.chatJsContentPath = "/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        this.pmWindows = [];

        // getting the adapter started. You cannot call the adapter BEFORE this is done.
        this.options.adapter.init(() => {

            var state = this.getState();

            // the controller must have a listener to the "messages-changed" event because it has to create
            // new PM windows when the user receives it
            this.options.adapter.client.onMessagesChanged((message: ChatMessageInfo) => {
                if (message.UserToId && message.UserToId == this.options.userId && !this.findPmWindowByOtherUserId(message.UserFromId)) {
                    this.createPmWindow(message.UserFromId, true, true);
                }
            });

            var chatRoomOptions = new ChatRoomsOptions();
            chatRoomOptions.adapter = this.options.adapter;
            chatRoomOptions.userId = this.options.userId;
            chatRoomOptions.offsetRight = this.options.offsetRight;
            chatRoomOptions.titleText = this.options.roomsTitleText;
            chatRoomOptions.availableRoomsText = this.options.availableRoomsText;
            chatRoomOptions.isMaximized = state ? state.rooms.isMaximized : true;
            chatRoomOptions.onStateChanged = () => {
                this.saveState();
            }
            chatRoomOptions.userClicked = userId => {
                if (userId != this.options.userId) {
                    // verify whether there's already a PM window for this user
                    var existingPmWindow = this.findPmWindowByOtherUserId(userId);
                    if (existingPmWindow)
                        existingPmWindow.focus();
                    else
                        this.createPmWindow(userId, true, true);
                }
            };


            this.chatRooms = $.chatRooms(chatRoomOptions);

            this.loadState(state);
        });

        // for debugging only
        window.chatJs = this;
    }

    // creates a new PM window for the given user
    createPmWindow(otherUserId: number, isMaximized: boolean, saveState: boolean): ChatPmWindow {
        var chatPmOptions = new ChatPmWindowOptions();
        chatPmOptions.userId = this.options.userId;
        chatPmOptions.otherUserId = otherUserId;
        chatPmOptions.adapter = this.options.adapter;
        chatPmOptions.typingText = this.options.typingText;
        chatPmOptions.isMaximized = isMaximized;
        chatPmOptions.chatJsContentPath = this.options.chatJsContentPath;
        chatPmOptions.onCreated = () => {
            this.organizePmWindows();
            if (saveState)
                this.saveState();
        };
        chatPmOptions.onClose = () => {
            for (var i = 0; i < this.pmWindows.length; i++)
                if (this.pmWindows[i].otherUserId == otherUserId) {
                    this.pmWindows.splice(i, 1);
                    this.saveState();
                    this.organizePmWindows();
                    break;
                }
        };
        chatPmOptions.onMaximizedStateChanged = () => {
            this.saveState();
        }

        var pmWindow = $.chatPmWindow(chatPmOptions); 

        this.pmWindows.push({
            otherUserId: otherUserId,
            conversationId: null,
            pmWindow: pmWindow
        });

        return pmWindow;
    }

    // saves the windows states
    saveState(): ChatJsState {
        var state = new ChatJsState();
        // persist pm windows state
        for (var i = 0; i < this.pmWindows.length; i++) {
            state.pmWindows.push({
                otherUserId: this.pmWindows[i].otherUserId,
                conversationId: null,
                isMaximized: this.pmWindows[i].pmWindow.isMaximized()
            });
        }
        // persist rooms state
        state.rooms = this.chatRooms.getState();

        switch (this.options.persistenceMode) {
        case "cookie":
            this.createCookie(this.options.persistenceCookieName, state);
            break;
        case "server":
            throw "Server persistence is not supported yet";
        default:
            throw "Invalid persistence mode. Available modes are: cookie and server";
        }
        return state;
    }

    getState(): ChatJsState {
        var state: ChatJsState;
        switch (this.options.persistenceMode) {
            case "cookie":
                state = this.readCookie(this.options.persistenceCookieName);
                break;
            case "server":
                throw "Server persistence is not supported yet";
            default:
                throw "Invalid persistence mode. Available modes are: cookie and server";
        }
        return state;
    }

    // loads the windows states
    loadState(state: ChatJsState = null) {

        // if a state hasn't been passed in, gets the state. If it continues to be null/undefined, then there's nothing to be done.
        if (!state)
            state = this.getState();
        if (!state)
            return;

        for (var i = 0; i < state.pmWindows.length; i++) {

            var shouldCreatePmWindow = true;

            // if there's already a PM window for the given user, we'll not create it
            if (this.pmWindows.length) {
                for (var j = 0; j < this.pmWindows.length; j++) {
                    if (state.pmWindows[i].otherUserId && this.pmWindows[j].otherUserId == state.pmWindows[j].otherUserId) {
                        shouldCreatePmWindow = false;
                        break;
                    }
                }
            }

            if (shouldCreatePmWindow)
                this.createPmWindow(state.pmWindows[i].otherUserId, state.pmWindows[i].isMaximized, false);
        }

        this.chatRooms.setState(state.rooms);
    }

    private eraseCookie(name: string): void {
        this.createCookie(name, "", -1);
    }

    // reads a cookie. The cookie value will be converted to a JSON object if possible, otherwise the value will be returned as is
    private readCookie(name: string): any {
        var nameEq = name + "=";
        var ca = document.cookie.split(';');
        var cookieValue: string;
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEq) == 0) {
                cookieValue = c.substring(nameEq.length, c.length);
            }
        }
        if (cookieValue) {
            try {
                return JSON.parse(cookieValue);
            } catch (e) {
                return cookieValue;
            }
        } else
            return null;
    }

    // creates a cookie. The passed in value will be converted to JSON, if not a string
    private createCookie(name: string, value: any, days?: number): void {
        var stringedValue: string;
        if (typeof value == "string")
            stringedValue = value;
        else
            stringedValue = JSON.stringify(value);
        if (value)
            var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + stringedValue + expires + "; path=/";
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
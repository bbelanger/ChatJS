interface JQueryStatic {
    chatWindow(options: ChatWindowOptions): ChatWindow;
}

class ChatWindowOptions {
    canExpand: boolean;
    width: number;
    height: number;
    canClose: boolean;
    title: string;
    isMaximized: boolean;
    onCreated: (chatWindow: ChatWindow) => void;
    onClose: (chatWindow: ChatWindow) => void;
    onMaximizedStateChanged: (chatWindow: ChatWindow, isMaximized: boolean) => void;
}

// a generic window that shows in the bottom right corner. It can have any content in it.
class ChatWindow {
    constructor(options: ChatWindowOptions) {

        var defaultOptions = new ChatWindowOptions();
        defaultOptions.isMaximized = true;
        defaultOptions.canExpand = true;
        defaultOptions.canClose = true;
        defaultOptions.onCreated = () => {};
        defaultOptions.onClose = () => {};
        defaultOptions.onMaximizedStateChanged = () => {};

        this.options = $.extend({}, defaultOptions, options);

        if (this.options.canExpand) {
            this.$windowTray = $("<div/>").addClass("chat-window-tray").appendTo($("body"));
            this.$windowTray.on("click", () => {
                this.toggleMaximizedState();
            });
        }

        // window
        this.$window = $("<div/>").addClass("chat-window").appendTo($("body"));
        if (this.options.canExpand)
            this.$window.addClass("expansible");
        if (this.options.width)
            this.$window.css("width", this.options.width);
        if (this.options.height)
            this.$window.css("height", this.options.height);

        // title
        this.$windowTitle = $("<div/>").addClass("chat-window-title").appendTo(this.$window);
        if (this.options.canClose) {
            var $closeButton = $("<div/>").addClass("close").appendTo(this.$windowTitle);
            $closeButton.click(e => {
                e.stopPropagation();
                // removes the window
                this.$window.remove();
                // triggers the event
                this.options.onClose(this);
            });
        }
        $("<div/>").addClass("text").text(this.options.title).appendTo(this.$windowTitle);

        // content
        this.$windowContent = $("<div/>").addClass("chat-window-content").appendTo(this.$window);
        this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(this.$windowContent);

        // wire everything up
        this.$windowTitle.click(() => {
            this.toggleMaximizedState();
        });

        this.setMaximized(this.options.isMaximized, false);

        this.options.onCreated(this);
    }

    getWidth() {
        return this.options.canExpand ? this.$windowTray.outerWidth() : this.$window.outerWidth();
    }

    setRightOffset(offset: number) {
        this.$window.css("right", offset);
        if (this.options.canExpand)
            this.$windowTray.css("right", offset);
    }

    setTitle(title: string) {
        $("div[class=text]", this.$windowTitle).text(title);
    }

    setVisible(visible: boolean) {
        if (visible)
            this.$window.show();
        else
            this.$window.hide();
    }

    // returns whether the window is maximized
    isMaximized(): boolean {
        return !this.$window.hasClass("minimized");
    }

    setMaximized(isMaximized: boolean, triggerMaximizedStateEvent = true): void {
        // windows are maximized if the this.$windowContent is visible
        if (!this.options.canExpand) {
            if (isMaximized) {
                // if it can't expand and is maximized
                this.$window.removeClass("minimized");
                this.$windowContent.show();
            } else {
                // if it can't expand and is minimized
                this.$window.addClass("minimized");
                this.$windowContent.hide();
            }
        } else {
            if (isMaximized) {
                // if it can expand and is maximized
                this.$window.show();
                this.$window.removeClass("minimized");
                this.$windowTray.removeClass("minimized");

            } else {
                // if it can't expand and is minimized
                this.$window.hide();
                this.$window.addClass("minimized");
                this.$windowTray.addClass("minimized");
            }
        }
        if (triggerMaximizedStateEvent)
            this.options.onMaximizedStateChanged(this, isMaximized);
    }

    toggleMaximizedState(): void {
        this.setMaximized(this.$window.hasClass("minimized"));
    }

    defaults: ChatWindowOptions;
    options: ChatWindowOptions;
    $windowTray: JQuery;
    $window: JQuery;
    $windowTitle: JQuery;
    $windowContent: JQuery;
    $windowInnerContent: JQuery;
}

// The actual plugin
$.chatWindow = (options: ChatWindowOptions) => {
    var chatWindow = new ChatWindow(options);
    return chatWindow;
};
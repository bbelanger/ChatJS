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
        if (!this.options.isMaximized)
            this.$windowContent.hide();

        this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(this.$windowContent);

        // wire everything up
        this.$windowTitle.click(() => {
            // windows are maximized if the this.$windowContent is visible
            this.$windowContent.toggle();
            if (!this.$windowContent.is(":visible"))
                this.$window.addClass("collapsed");
            else
                this.$window.removeClass("collapsed");
            this.options.onMaximizedStateChanged(this, this.isMaximized());
        });

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
        return this.$windowContent.is(":visible");
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
var ChatWindowOptions = (function () {
    function ChatWindowOptions() {
    }
    return ChatWindowOptions;
})();

var ChatWindow = (function () {
    function ChatWindow(options) {
        var _this = this;
        var defaultOptions = new ChatWindowOptions();
        defaultOptions.isMaximized = true;
        defaultOptions.canExpand = true;
        defaultOptions.canClose = true;
        defaultOptions.onCreated = function () {
        };
        defaultOptions.onClose = function () {
        };
        defaultOptions.onMaximizedStateChanged = function () {
        };

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
            $closeButton.click(function (e) {
                e.stopPropagation();

                // removes the window
                _this.$window.remove();

                // triggers the event
                _this.options.onClose(_this);
            });
        }
        $("<div/>").addClass("text").text(this.options.title).appendTo(this.$windowTitle);

        // content
        this.$windowContent = $("<div/>").addClass("chat-window-content").appendTo(this.$window);
        if (!this.options.isMaximized)
            this.$windowContent.hide();

        this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(this.$windowContent);

        // wire everything up
        this.$windowTitle.click(function () {
            // windows are maximized if the this.$windowContent is visible
            _this.$windowContent.toggle();
            if (!_this.$windowContent.is(":visible"))
                _this.$window.addClass("collapsed");
            else
                _this.$window.removeClass("collapsed");
            _this.options.onMaximizedStateChanged(_this, _this.isMaximized());
        });

        this.options.onCreated(this);
    }
    ChatWindow.prototype.getWidth = function () {
        return this.options.canExpand ? this.$windowTray.outerWidth() : this.$window.outerWidth();
    };

    ChatWindow.prototype.setRightOffset = function (offset) {
        this.$window.css("right", offset);
        if (this.options.canExpand)
            this.$windowTray.css("right", offset);
    };

    ChatWindow.prototype.setTitle = function (title) {
        $("div[class=text]", this.$windowTitle).text(title);
    };

    ChatWindow.prototype.setVisible = function (visible) {
        if (visible)
            this.$window.show();
        else
            this.$window.hide();
    };

    // returns whether the window is maximized
    ChatWindow.prototype.isMaximized = function () {
        return this.$windowContent.is(":visible");
    };
    return ChatWindow;
})();

// The actual plugin
$.chatWindow = function (options) {
    var chatWindow = new ChatWindow(options);
    return chatWindow;
};
//# sourceMappingURL=jquery.chatjs.window.js.map

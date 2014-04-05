// CHAT CONTAINER
(function ($) {

    function ChatWindow(options) {
        /// <summary>This is a window container, responsible for hosting both the users list and the chat window </summary>
        /// <param FullName="options" type=""></param>
        this.defaults = {
            objectType: null,
            objectName: null,
            title: null,
            canExpand: true,
            canClose: true,
            width: null,
            height: null,
            initialToggleState: "maximized",
            onCreated: function (chatContainer) { },
            onClose: function (chatContainer) { },
            // triggers when the window changes it's state: minimized or maximized
            onToggleStateChanged: function (currentState) { }
        };

        //Extending options:
        this.options = $.extend({}, this.defaults, options);

        //Privates:
        this.$el = null;
        this.$window = null;
        this.$windowTitle = null;
        this.$windowContent = null;
        this.$windowInnerContent = null;
    }

    // Separate functionality from object creation
    ChatWindow.prototype = {
        init: function () {
            var _this = this;

            if (_this.options.canExpand) {
                _this.$windowTray = $("<div/>").addClass("chat-window-tray").appendTo($("body"));
            }

            // window
            _this.$window = $("<div/>").addClass("chat-window").appendTo($("body"));
            if (_this.options.canExpand)
                _this.$window.addClass("expansible");
            if (_this.options.width)
                _this.$window.css("width", _this.options.width);
            if (_this.options.height)
                _this.$window.css("height", _this.options.height);

            // title
            _this.$windowTitle = $("<div/>").addClass("chat-window-title").appendTo(_this.$window);
            if (_this.options.canClose) {
                var $closeButton = $("<div/>").addClass("close").appendTo(_this.$windowTitle);
                $closeButton.click(function (e) {
                    e.stopPropagation();

                    // removes this item from the collection
                    for (var i = 0; i < $._chatContainers.length; i++) {
                        if ($._chatContainers[i] == _this) {
                            $._chatContainers.splice(i, 1);
                            break;
                        }
                    }

                    // removes the window
                    _this.$window.remove();

                    // triggers the event
                    _this.options.onClose(_this);
                });

            }

            $("<div/>").addClass("text").text(_this.options.title).appendTo(_this.$windowTitle);

            // content
            _this.$windowContent = $("<div/>").addClass("chat-window-content").appendTo(_this.$window);
            if (_this.options.initialToggleState == "minimized")
                _this.$windowContent.hide();

            _this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(_this.$windowContent);

            // wire everything up
            _this.$windowTitle.click(function () {
                _this.$windowContent.toggle();
                if (!_this.$windowContent.is(":visible"))
                    _this.$window.addClass("collapsed");
                else
                    _this.$window.removeClass("collapsed");
                
                _this.options.onToggleStateChanged(_this.$windowContent.is(":visible") ? "maximized" : "minimized");
            });

            // enlists this container in the containers
            if (!$._chatContainers)
                $._chatContainers = new Array();
            $._chatContainers.push(_this);

            $.organizeChatContainers();

            _this.options.onCreated(_this);
        },

        getTrayWidth: function () {
            var _this = this;
            return _this.options.canExpand ? _this.$windowTray.outerWidth() : _this.$window.outerWidth();
        },

        setRightOffset: function (offset) {
            var _this = this;
            _this.$window.css("right", offset);
            if (_this.options.canExpand)
                _this.$windowTray.css("right", offset);
        },

        getContent: function () {
            /// <summary>Gets the content of the chat window. This HTML element is the container for any chat window content</summary>
            /// <returns type="Object"></returns>
            var _this = this;
            return _this.$windowInnerContent;
        },

        setTitle: function (title) {
            var _this = this;
            $("div[class=text]", _this.$windowTitle).text(title);
        },

        setVisible: function (visible) {
            /// <summary>Sets the window visible or not</summary>
            /// <param FullName="visible" type="Boolean">Whether it's visible</param>
            var _this = this;
            if (visible)
                _this.$window.show();
            else
                _this.$window.hide();
        },

        getToggleState: function () {
            var _this = this;
            return _this.$windowContent.is(":visible") ? "maximized" : "minimized";
        },

        setToggleState: function (state) {
            var _this = this;
            if (state == "minimized")
                _this.$windowContent.hide();
            else if (state == "maximized")
                _this.$windowContent.show();
        }
    };

    // The actual plugin
    $.chatWindow = function (options) {
        var chatContainer = new ChatWindow(options);
        chatContainer.init();

        return chatContainer;
    };

    $.organizeChatContainers = function () {
        // this is the initial right offset
        var rightOffset = 10;
        var deltaOffset = 2;
        for (var i = 0; i < $._chatContainers.length; i++) {
            $._chatContainers[i].setRightOffset(rightOffset);
            rightOffset += $._chatContainers[i].getTrayWidth() + deltaOffset;
        }
    };

})(jQuery);
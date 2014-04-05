// CHAT WINDOW
(function ($) {

    function ChatPmWindow(options) {
        /// <summary>This is the chat window for a user.. contains the chat messages</summary>
        /// <param FullName="options" type="Object"></param>
        // Defaults:
        this.defaults = {
            chat: null,
            userId: null,
            otherUserId: null,
            conversationId: null,
            typingText: " is typing...",
            adapter: null,
            onClose: function () { }
        };

        //Extending options:
        this.options = $.extend({}, this.defaults, options);

        //Privates:
        this.$el = null;

        this.chatWindow = null;

    }

    // Separate functionality from object creation
    ChatPmWindow.prototype = {

        init: function () {
            var _this = this;

            _this.options.adapter.server.getUserInfo(_this.options.otherUserId, function (userInfo) {
                _this.chatWindow = $.chatWindow({
                    title: userInfo.Name,
                    canClose: true,
                    canExpand: false,
                    onCreated: function (window) {
                        window.$windowInnerContent.messageBoard({
                            adapter: _this.options.adapter,
                            userId: _this.options.userId,
                            otherUserId: _this.options.otherUserId,
                        });
                    }
                });
            });

            

        },

        focus: function () {
            var _this = this;
            _this.chatWindow.$textBox.focus();
        },
        
    };

    // The actual plugin
    $.chatPmWindow = function (options) {
        var pmWindow = new ChatPmWindow(options);
        pmWindow.init();
        return pmWindow;
    };

})(jQuery);
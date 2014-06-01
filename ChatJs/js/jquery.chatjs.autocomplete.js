var ChatJsAutocompleteOptions = (function () {
    function ChatJsAutocompleteOptions() {
    }
    return ChatJsAutocompleteOptions;
})();

var ChatJsAutocomplete = (function () {
    function ChatJsAutocomplete($el, options) {
        this.$el = $el;

        var defaultOptions = new ChatJsAutocompleteOptions();
        defaultOptions.autoShow = false;

        this.options = $.extend({}, defaultOptions, options);

        if (this.options.autoShow)
            this.show();
    }
    // shows the autocomplete
    ChatJsAutocomplete.prototype.show = function () {
        var $flyout = $("<div/>").addClass("flyout-box").prependTo(this.$el);

        var $flyoutButtonWrapper = $("<div/>").addClass("button-wrapper").appendTo($flyout);
        var $flyoutTextWrapper = $("<div/>").addClass("text-wrapper").appendTo($flyout);

        this.$textBox = $("<input />").attr("type", "text").addClass("flyout-text-box").appendTo($flyoutTextWrapper);
    };

    // hides the autocomplete
    ChatJsAutocomplete.prototype.hide = function () {
    };
    return ChatJsAutocomplete;
})();

$.fn.chatjsAutocomplete = function (options) {
    if (this.length) {
        this.each(function () {
            var data = new ChatJsAutocomplete($(this), options);
            $(this).data('chatjsAutocomplete', data);
        });
    }
    return this;
};
//# sourceMappingURL=jquery.chatjs.autocomplete.js.map

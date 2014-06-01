interface JQuery {
    chatjsAutocomplete(options: ChatJsAutocompleteOptions): JQuery;
}

class ChatJsAutocompleteOptions {
    // whether or not the autocomplete will automatically show
    autoShow: boolean;
}

class ChatJsAutocomplete {
    constructor($el: JQuery, options: ChatJsAutocompleteOptions) {
        this.$el = $el;

        var defaultOptions = new ChatJsAutocompleteOptions();
        defaultOptions.autoShow = false;

        this.options = $.extend({}, defaultOptions, options);

        if (this.options.autoShow)
            this.show();
    }

    // shows the autocomplete
    show(): void {
        var $flyout = $("<div/>").addClass("flyout-box").prependTo(this.$el);

        var $flyoutButtonWrapper = $("<div/>").addClass("button-wrapper").appendTo($flyout);
        var $flyoutTextWrapper = $("<div/>").addClass("text-wrapper").appendTo($flyout);

        this.$textBox = $("<input />").attr("type", "text").addClass("flyout-text-box").appendTo($flyoutTextWrapper);
    }

    // hides the autocomplete
    hide(): void {

    }

    $el: JQuery;
    options: ChatJsAutocompleteOptions;
    $textBox: JQuery;
}

$.fn.chatjsAutocomplete = function(options: ChatJsAutocompleteOptions) {
    if (this.length) {
        this.each(function() {
            var data = new ChatJsAutocomplete($(this), options);
            $(this).data('chatjsAutocomplete', data);
        });
    }
    return this;
};
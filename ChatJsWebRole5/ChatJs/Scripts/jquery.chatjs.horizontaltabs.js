function HorizontalTabs(el, options) {

    this.defaults = {
    };

    this.$el = $(el);

    //Extending options:
    this.opts = $.extend({}, this.defaults, options);
}

HorizontalTabs.prototype = {
    tabs: new Object(),
    init: function () {
        var _this = this;
        _this.$el.addClass("horizontal-tab");
        _this.$contentWrapper = $("<div/>").addClass("tab-content-holder").insertAfter(_this.$el);
    },
    addTab: function (id, displayName, selected, contentBuilder, onFocus) {
        var _this = this;
        var $li = $("<li/>").appendTo(_this.$el);
        $li.text(displayName);

        var $content = $("<div/>").addClass("tab-content").appendTo(_this.$contentWrapper);
        if (contentBuilder)
            contentBuilder($content);

        _this.tabs[id] = {
            $li: $li,
            $content: $content,
            onFocus: onFocus
        };

        $li.click(function () {
            _this.focusTab(id);
        });

        if (selected)
            _this.focusTab(id);
    },

    focusTab: function (tabId) {
        var _this = this;
        if (_this.tabs[tabId]) {
            $("li", _this.$el).removeClass("selected");
            _this.tabs[tabId].$li.addClass("selected");
            $(".tab-content", _this.$contentWrapper).removeClass("selected-tab");
            _this.tabs[tabId].$content.addClass("selected-tab");
            if (_this.tabs[tabId].onFocus)
                _this.tabs[tabId].onFocus();
        }
    },

    hasTab: function (tabId) {
        var _this = this;
        return _this.tabs[tabId];
    }
};

$.fn.horizontalTabs = function (options) {
    if (this.length) {
        this.each(function () {
            var data = new HorizontalTabs(this, options);
            data.init();
            $(this).data('horizontalTabs', data);
        });
    }
    return this;
};
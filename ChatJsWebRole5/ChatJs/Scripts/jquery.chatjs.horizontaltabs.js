function HorizontalTabs(el, options) {

    this.defaults = {
    };

    this.$el = $(el);

    //Extending options:
    this.options = $.extend({}, this.defaults, options);
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
        var $li = $("<li/>").attr("data-val-id", id).appendTo(_this.$el);

        _this.$titleText = $("<span/>").addClass("text").appendTo($li);
        _this.$titleText.text(displayName);

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

    getFucusedTabId: function() {
        /// <summary>Gets the focused tab id, or null if no tab is currently focused</summary>
        var _this = this;
        var $selectedTab = $("li.selected", _this.$el);
        if ($selectedTab.length)
            return $selectedTab.attr("data-val-id");
        return null;
    },

    hasTab: function (tabId) {
        var _this = this;
        return _this.tabs[tabId];
    },

    addEventMark: function(tabId) {
        /// <summary>Adds an event mark to the tab</summary>
        /// <param name="tabId" type="Number">Tab id</param>

        var _this = this;
        var $eventMark = $(".event-mark", _this.$titleText);
        if (!$eventMark.length)
            $eventMark = $("<span/>").addClass("event-mark").appendTo(_this.$titleText);
        var currentEventCount = $eventMark.text() == "" ? 0 : parseInt($eventMark.text());
        currentEventCount++;
        $eventMark.text(currentEventCount);
    },

    clearEventMarks: function(tabId) {
        /// <summary>Removes all event marks from the tab</summary>
        /// <param name="tabId" type="Number">Tab id</param>

        var _this = this;
        var $eventMark = $(".event-mark", _this.$titleText);
        $eventMark.remove();
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
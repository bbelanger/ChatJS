var HorizontalTabsOptions = (function () {
    function HorizontalTabsOptions() {
    }
    return HorizontalTabsOptions;
})();

var HorizontalTab = (function () {
    function HorizontalTab($li, $content, onFocus) {
        this.$li = $li;
        this.$content = $content;
        this.onFocus = onFocus;
    }
    return HorizontalTab;
})();

var HorizontalTabs = (function () {
    function HorizontalTabs($el, options) {
        this.$el = $el;

        var defaultOptions = new HorizontalTabsOptions();
        defaultOptions.onTabClosed = function () {
        };

        this.options = $.extend({}, defaultOptions, options);

        this.$el.addClass("horizontal-tab");
        this.$contentWrapper = $("<div/>").addClass("tab-content-holder").insertAfter(this.$el);
        this.tabs = {};
    }
    HorizontalTabs.prototype.addTab = function (id, displayName, selected, canClose, contentBuilder, onFocus, focusTab, triggerOnFocus) {
        var _this = this;
        if (typeof selected === "undefined") { selected = false; }
        if (typeof canClose === "undefined") { canClose = true; }
        if (typeof contentBuilder === "undefined") { contentBuilder = null; }
        if (typeof onFocus === "undefined") { onFocus = null; }
        if (typeof focusTab === "undefined") { focusTab = true; }
        if (typeof triggerOnFocus === "undefined") { triggerOnFocus = true; }
        var $li = $("<li/>").attr("data-val-id", id).appendTo(this.$el);

        this.$titleText = $("<span/>").addClass("text").appendTo($li);
        this.$titleText.text(displayName);

        if (canClose) {
            var $closeButton = $("<span/>").addClass("close").appendTo(this.$titleText);
            $closeButton.on("click", function (e) {
                e.preventDefault();
                _this.removeTab(id);
            });
        }

        var $content = $("<div/>").addClass("tab-content").appendTo(this.$contentWrapper);
        if (contentBuilder)
            contentBuilder($content);

        this.tabs[id] = new HorizontalTab($li, $content, onFocus);

        $li.click(function () {
            _this.focusTab(id);
        });

        if (selected && focusTab)
            this.focusTab(id, triggerOnFocus);
    };

    HorizontalTabs.prototype.removeTab = function (id) {
        var $li = $("li[data-val-id=" + id + "]", this.$el);
        this.options.onTabClosed(id);
        if (this.tabs[id])
            delete this.tabs[id];

        // when a tab closes, it's necessary to focus another tab
        var $siblingTabs = $li.siblings();
        if ($siblingTabs.length) {
            var tabToFocus = $siblingTabs.eq(0);
            var idToFocus = $(tabToFocus).attr("data-val-id");
            this.focusTab(parseInt(idToFocus));
        }
        $li.remove();
    };

    HorizontalTabs.prototype.focusTab = function (tabId, triggerOnFocus) {
        if (typeof triggerOnFocus === "undefined") { triggerOnFocus = true; }
        if (this.tabs[tabId]) {
            $("li", this.$el).removeClass("selected");
            this.tabs[tabId].$li.addClass("selected");
            $(".tab-content", this.$contentWrapper).removeClass("selected-tab");
            this.tabs[tabId].$content.addClass("selected-tab");
            if (this.tabs[tabId].onFocus && triggerOnFocus)
                this.tabs[tabId].onFocus();
        }
    };

    // returns the id of the currently selected tab
    HorizontalTabs.prototype.getFucusedTabId = function () {
        var $selectedTab = $("li.selected", this.$el);
        return $selectedTab.length ? parseInt($selectedTab.attr("data-val-id")) : null;
    };

    // returns the current tab, if any. Undefined if there's no tabs
    HorizontalTabs.prototype.hasTab = function (tabId) {
        return !!this.tabs[tabId];
    };

    HorizontalTabs.prototype.getTab = function (tabId) {
        return this.tabs[tabId];
    };

    HorizontalTabs.prototype.getTabIds = function () {
        var tabIds = [];
        for (var id in this.tabs)
            if (!isNaN(id))
                tabIds.push(id);
        return tabIds;
    };

    HorizontalTabs.prototype.addEventMark = function (tabId) {
        var $eventMark = $(".event-mark", this.$titleText);
        if (!$eventMark.length)
            $eventMark = $("<span/>").addClass("event-mark").appendTo(this.$titleText);
        var currentEventCount = $eventMark.text() == "" ? 0 : parseInt($eventMark.text());
        currentEventCount++;
        $eventMark.text(currentEventCount);
    };

    HorizontalTabs.prototype.clearEventMarks = function (tabId) {
        var $eventMark = $(".event-mark", this.$titleText);
        $eventMark.remove();
    };
    return HorizontalTabs;
})();

$.fn.horizontalTabs = function (options) {
    if (this.length) {
        this.each(function () {
            var data = new HorizontalTabs($(this), options);
            $(this).data('horizontalTabs', data);
        });
    }
    return this;
};
//# sourceMappingURL=jquery.chatjs.horizontaltabs.js.map

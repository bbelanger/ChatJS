/// <reference path="../jquery/jquery.d.ts"/>
var HorizontalTab = (function () {
    function HorizontalTab($li, $content, onFocus) {
        this.$li = $li;
        this.$content = $content;
        this.onFocus = onFocus;
    }
    return HorizontalTab;
})();

var HorizontalTabs = (function () {
    function HorizontalTabs($el) {
        this.$el = $el;
        this.$el.addClass("horizontal-tab");
        this.$contentWrapper = $("<div/>").addClass("tab-content-holder").insertAfter(this.$el);
    }
    HorizontalTabs.prototype.addTab = function (id, displayName, selected, contentBuilder, onFocus) {
        var _this = this;
        if (typeof selected === "undefined") { selected = false; }
        if (typeof contentBuilder === "undefined") { contentBuilder = null; }
        if (typeof onFocus === "undefined") { onFocus = null; }
        var $li = $("<li/>").attr("data-val-id", id).appendTo(this.$el);

        this.$titleText = $("<span/>").addClass("text").appendTo($li);
        this.$titleText.text(displayName);

        var $content = $("<div/>").addClass("tab-content").appendTo(this.$contentWrapper);
        if (contentBuilder)
            contentBuilder($content);

        this.tabs[id] = new HorizontalTab($li, $content, onFocus);

        $li.click(function () {
            _this.focusTab(id);
        });

        if (selected)
            this.focusTab(id);
    };

    HorizontalTabs.prototype.focusTab = function (tabId) {
        if (this.tabs[tabId]) {
            $("li", this.$el).removeClass("selected");
            this.tabs[tabId].$li.addClass("selected");
            $(".tab-content", this.$contentWrapper).removeClass("selected-tab");
            this.tabs[tabId].$content.addClass("selected-tab");
            if (this.tabs[tabId].onFocus)
                this.tabs[tabId].onFocus();
        }
    };

    HorizontalTabs.prototype.getFucusedTabId = function () {
        var $selectedTab = $("li.selected", this.$el);
        if ($selectedTab.length)
            return $selectedTab.attr("data-val-id");
        return null;
    };

    HorizontalTabs.prototype.hasTab = function (tabId) {
        return this.tabs[tabId];
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

$.fn.horizontalTabs = function () {
    if (this.length) {
        this.each(function () {
            var data = new HorizontalTabs($(this));
            $(this).data('horizontalTabs', data);
        });
    }
    return this;
};
//# sourceMappingURL=jquery.chatjs.horizontaltabs.js.map

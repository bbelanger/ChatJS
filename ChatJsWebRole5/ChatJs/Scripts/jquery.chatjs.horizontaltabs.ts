interface JQuery {
    horizontalTabs(): JQuery;
}

class HorizontalTabsOptions {
    onTabClosed: (id: number) => void;
}

class HorizontalTab {
    constructor($li: JQuery, $content: JQuery, onFocus: () => void) {
        this.$li = $li;
        this.$content = $content;
        this.onFocus = onFocus;
    }

    $li: JQuery;
    $content: JQuery;
    onFocus: () => void;
}

class HorizontalTabs {
    constructor($el: JQuery, options: HorizontalTabsOptions) {
        this.$el = $el;

        var defaultOptions = new HorizontalTabsOptions();
        defaultOptions.onTabClosed = () => {};

        this.options = $.extend({}, defaultOptions, options);

        this.$el.addClass("horizontal-tab");
        this.$contentWrapper = $("<div/>").addClass("tab-content-holder").insertAfter(this.$el);
        this.tabs = {};
    }

    addTab(id: number, displayName: string, selected: boolean = false, canClose: boolean = true, contentBuilder: (jQuery) => void = null, onFocus: () => void = null, focusTab = true, triggerOnFocus: boolean = true) {
        var $li = $("<li/>").attr("data-val-id", id).appendTo(this.$el);

        this.$titleText = $("<span/>").addClass("text").appendTo($li);
        this.$titleText.text(displayName);

        if (canClose) {
            var $closeButton = $("<span/>").addClass("close").appendTo(this.$titleText);
            $closeButton.on("click", (e) => {
                e.preventDefault();
                this.removeTab(id);
            });
        }

        var $content = $("<div/>").addClass("tab-content").appendTo(this.$contentWrapper);
        if (contentBuilder)
            contentBuilder($content);

        this.tabs[id] = new HorizontalTab($li, $content, onFocus);

        $li.click(() => {
            this.focusTab(id);
        });

        if (selected && focusTab)
            this.focusTab(id, triggerOnFocus);
    }

    removeTab(id: number) {
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
    }

    focusTab(tabId: number, triggerOnFocus: boolean = true) {
        if (this.tabs[tabId]) {
            $("li", this.$el).removeClass("selected");
            this.tabs[tabId].$li.addClass("selected");
            $(".tab-content", this.$contentWrapper).removeClass("selected-tab");
            this.tabs[tabId].$content.addClass("selected-tab");
            if (this.tabs[tabId].onFocus && triggerOnFocus)
                this.tabs[tabId].onFocus();
        }
    }

    // returns the id of the currently selected tab
    getFucusedTabId(): number {
        var $selectedTab = $("li.selected", this.$el);
        return $selectedTab.length ? parseInt($selectedTab.attr("data-val-id")) : null;
    }

    // returns the current tab, if any. Undefined if there's no tabs
    hasTab(tabId: number) {
        return this.tabs[tabId];
    }

    getTabIds(): Array<number> {
        var tabIds: Array<number> = [];
        for (var id in this.tabs)
            if (!isNaN(id))
                tabIds.push(id);
        return tabIds;
    }

    addEventMark(tabId) {
        var $eventMark = $(".event-mark", this.$titleText);
        if (!$eventMark.length)
            $eventMark = $("<span/>").addClass("event-mark").appendTo(this.$titleText);
        var currentEventCount = $eventMark.text() == "" ? 0 : parseInt($eventMark.text());
        currentEventCount++;
        $eventMark.text(currentEventCount);
    }

    clearEventMarks(tabId) {
        var $eventMark = $(".event-mark", this.$titleText);
        $eventMark.remove();
    }

    $el: JQuery;
    $contentWrapper: JQuery;
    $titleText: JQuery;
    tabs: { [id: string]: HorizontalTab };
    options: HorizontalTabsOptions;
}

$.fn.horizontalTabs = function(options: HorizontalTabsOptions) {
    if (this.length) {
        this.each(function() {
            var data = new HorizontalTabs($(this), options);
            $(this).data('horizontalTabs', data);
        });
    }
    return this;
};
/// <reference path="../jquery/jquery.d.ts"/>

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

class HorizontalTabs
{
    constructor($el: JQuery) {
        this.$el = $el;
        this.$el.addClass("horizontal-tab");
        this.$contentWrapper = $("<div/>").addClass("tab-content-holder").insertAfter(this.$el);
    }

    addTab(id: string, displayName: string, selected: boolean = false, contentBuilder: (jQuery) => void = null, onFocus: () => void = null) {
        var $li = $("<li/>").attr("data-val-id", id).appendTo(this.$el);

        this.$titleText = $("<span/>").addClass("text").appendTo($li);
        this.$titleText.text(displayName);

        var $content = $("<div/>").addClass("tab-content").appendTo(this.$contentWrapper);
        if (contentBuilder)
            contentBuilder($content);

        this.tabs[id] = new HorizontalTab($li, $content, onFocus);

        $li.click(() => {
            this.focusTab(id);
        });

        if (selected)
            this.focusTab(id);
    }

    focusTab(tabId: string) {
        if (this.tabs[tabId]) {
            $("li", this.$el).removeClass("selected");
            this.tabs[tabId].$li.addClass("selected");
            $(".tab-content", this.$contentWrapper).removeClass("selected-tab");
            this.tabs[tabId].$content.addClass("selected-tab");
            if (this.tabs[tabId].onFocus)
                this.tabs[tabId].onFocus();
        }
    }

    getFucusedTabId() {
        var $selectedTab = $("li.selected", this.$el);
        if ($selectedTab.length)
            return $selectedTab.attr("data-val-id");
        return null;
    }

    hasTab(tabId) {
        return this.tabs[tabId];
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
    tabs: { [id: string] : HorizontalTab };

    
}

$.fn.horizontalTabs = function () {
    if (this.length) {
        this.each(function () {
            var data = new HorizontalTabs($(this));
            $(this).data('horizontalTabs', data);
        });
    }
    return this;
};

interface JQuery {
    horizontalTabs(): JQuery;
}
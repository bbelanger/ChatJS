(function ($) {

    function UserList(el, options) {

        this.defaults = {
            adapter: null,
            conversationId: null,
            roomId: null,
            emptyListText: "No users",
            userClicked: function (userId) { }
        };

        this.$el = $(el);

        //Extending options:
        this.options = $.extend({}, this.defaults, options);
    }

    UserList.prototype = {
        init: function () {
            var _this = this;
            // when the user list changed, this list must be updated
            _this.options.adapter.client.on("user-list-changed", function (data) {
                if ((_this.options.roomId && data.roomId == _this.options.roomId) ||
                    (_this.options.conversationId && _this.options.conversationId == data.conversationId))
                    _this.populateList(data.userList);
            });
            // loads the list now
            _this.options.adapter.server.getUserList({
                roomId: _this.options.roomId,
                conversationId: _this.options.conversationId
            }, function (userList) {
                _this.populateList(userList);
            });
        },
        populateList: function (userList) {
            var _this = this;
            _this.$el.html('');
            if (userList.length == 0) {
                $("<div/>").addClass("user-list-empty").text(_this.options.emptyListText).appendTo(_this.$el);
            } else {
                for (var i = 0; i < userList.length; i++) {

                    var $userListItem = $("<div/>")
                        .addClass("user-list-item")
                        .attr("data-val-id", userList[i].Id)
                        .appendTo(_this.$el);

                    $("<img/>")
                        .addClass("profile-picture")
                        .attr("src", userList[i].ProfilePictureUrl)
                        .appendTo($userListItem);

                    $("<div/>")
                        .addClass("profile-status")
                        .addClass(userList[i].Status == 0 ? "offline" : "online")
                        .appendTo($userListItem);

                    $("<div/>")
                        .addClass("content")
                        .text(userList[i].Name)
                        .appendTo($userListItem);

                    // makes a click in the user to either create a new chat window or open an existing
                    // I must clusure the 'i'
                    (function (userId) {
                        // handles clicking in a user. Starts up a new chat session
                        $userListItem.click(function () {
                            _this.options.userClicked(userId);
                        });
                    })(userList[i].Id);
                }
            }
        }
    };

    $.fn.userList = function (options) {
        if (this.length) {
            this.each(function () {
                var data = new UserList(this, options);
                data.init();
                $(this).data('userList', data);
            });
        }
        return this;
    };

})(jQuery);
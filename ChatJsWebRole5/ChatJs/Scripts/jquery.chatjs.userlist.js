var UserListOptions = (function () {
    function UserListOptions() {
    }
    return UserListOptions;
})();

var UserList = (function () {
    function UserList(jQuery, options) {
        var _this = this;
        this.$el = jQuery;

        var defaultOptions = new UserListOptions();
        defaultOptions.emptyListText = "No users";
        defaultOptions.userClicked = function (userId) {
        };

        this.options = $.extend({}, defaultOptions, options);

        // when the user list changed, this list must be updated
        this.options.adapter.client.onUserListChanged(function (userListData) {
            if ((_this.options.roomId && userListData.RoomId == _this.options.roomId) || (_this.options.conversationId && _this.options.conversationId == userListData.ConversationId))
                _this.populateList(userListData.UserList);
        });

        // loads the list now
        this.options.adapter.server.getUserList(this.options.roomId, this.options.conversationId, function (userList) {
            _this.populateList(userList);
        });
    }
    UserList.prototype.populateList = function (userList) {
        var _this = this;
        this.$el.html('');
        if (userList.length == 0) {
            $("<div/>").addClass("user-list-empty").text(this.options.emptyListText).appendTo(this.$el);
        } else {
            for (var i = 0; i < userList.length; i++) {
                var $userListItem = $("<div/>").addClass("user-list-item").attr("data-val-id", userList[i].Id).appendTo(this.$el);

                $("<img/>").addClass("profile-picture").attr("src", userList[i].ProfilePictureUrl).appendTo($userListItem);

                $("<div/>").addClass("profile-status").addClass(userList[i].Status == 0 ? "offline" : "online").appendTo($userListItem);

                $("<div/>").addClass("content").text(userList[i].Name).appendTo($userListItem);

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
    };
    return UserList;
})();

$.fn.userList = function (options) {
    if (this.length) {
        this.each(function () {
            var data = new UserList($(this), options);
            $(this).data('userList', data);
        });
    }
    return this;
};
//# sourceMappingURL=jquery.chatjs.userlist.js.map

interface JQuery {
    userList: (options: UserListOptions) => JQuery;
}

class UserListOptions {
    adapter: IAdapter;
    conversationId: number;
    roomId: number;
    emptyListText: string;
    userClicked: (userId: number) => void;
}

class UserList {
    constructor(jQuery: JQuery, options: UserListOptions) {
        this.$el = jQuery;

        var defaultOptions = new UserListOptions();
        defaultOptions.emptyListText = "No users";
        defaultOptions.userClicked = (userId: number) => {};

        this.options = $.extend({}, defaultOptions, options);

        // when the user list changed, this list must be updated
        this.options.adapter.client.onUserListChanged((userListData: ChatUserListChangedInfo) => {
            if ((this.options.roomId && userListData.RoomId == this.options.roomId) ||
            (this.options.conversationId && this.options.conversationId == userListData.ConversationId))
                this.populateList(userListData.UserList);
        });

        // loads the list now
        this.options.adapter.server.getUserList(this.options.roomId, this.options.conversationId, userList => {
            this.populateList(userList);
        });
    }


    populateList(userList) {
        this.$el.html('');
        if (userList.length == 0) {
            $("<div/>").addClass("user-list-empty").text(this.options.emptyListText).appendTo(this.$el);
        } else {
            for (var i = 0; i < userList.length; i++) {

                var $userListItem = $("<div/>")
                    .addClass("user-list-item")
                    .attr("data-val-id", userList[i].Id)
                    .appendTo(this.$el);

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
                (userId => {
                    // handles clicking in a user. Starts up a new chat session
                    $userListItem.click(() => {
                        this.options.userClicked(userId);
                    });
                })(userList[i].Id);
            }
        }
    }

    $el: JQuery;
    options: UserListOptions;
}


$.fn.userList = function(options: UserListOptions) {
    if (this.length) {
        this.each(function() {
            var data = new UserList($(this), options);
            $(this).data('userList', data);
        });
    }
    return this;
};
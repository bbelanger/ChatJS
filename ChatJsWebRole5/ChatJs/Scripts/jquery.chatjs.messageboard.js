(function ($) {

    function MessageBoard(el, options) {

        this.defaults = {
            adapter: null,
            // current user id
            userId: null,
            // in case this is a PM board, this is the other user id
            otherUserId: null,
            // in case this is a room board, this is the room id
            roomId: null,
            // in case this is a conversation board, this is the conversation id
            conversationId: null,
            // text displayed while the other user is typing
            typingText: " is typing...",
            // whether to play sound when message arrives
            playSound: true
        };

        this.$el = $(el);
        this.$messagesWrapper = null;

        //Extending options:
        this.opts = $.extend({}, this.defaults, options);
    }

    MessageBoard.prototype = {
        init: function () {
            var _this = this;

            _this.$messagesWrapper = $("<div/>").addClass("messages-wrapper").appendTo(_this.$el);

            // sets up the text
            var $windowTextBoxWrapper = $("<div/>").addClass("chat-window-text-box-wrapper").appendTo(_this.$el);
            _this.$textBox = $("<textarea />").attr("rows", "1").addClass("chat-window-text-box").appendTo($windowTextBoxWrapper);
            _this.$textBox.autosize({
                callback: function (ta) {
                    var messagesHeight = 235 - $(ta).outerHeight();
                    console.log(messagesHeight);
                    _this.$messagesWrapper.height(messagesHeight);
                }
            });

            _this.$textBox.keypress(function (e) {
                // if a send typing signal is in course, remove it and create another
                if (_this.$sendTypingSignalTimeout == undefined) {
                    _this.$sendTypingSignalTimeout = setTimeout(function () {
                        _this.$sendTypingSignalTimeout = undefined;
                    }, 3000);
                    _this.sendTypingSignal();
                }

                if (e.which == 13) {
                    e.preventDefault();
                    if ($(this).val()) {
                        _this.sendMessage($(this).val());
                        $(this).val('').trigger("autosize.resize");
                    }
                }
            });

            _this.opts.adapter.client.on("typing-signal-received", function (user) {
                if (user.Id != _this.opts.userId)
                    _this.showTypingSignal(user);
            });

            _this.opts.adapter.client.on("messages-changed", function (message) {
                if (message.UserToId == _this.opts.userId || message.ConversationId == _this.opts.conversationId || message.RoomId == _this.opts.roomId) {
                    _this.addMessage(message);
                    if (_this.opts.playSound)
                        _this.playSound("/chatjs/sounds/chat");
                }
            });
        },

        addMessage: function (message, clientGuid) {
            /// <summary>Adds a message to the board. This method is called both when the current user or the other user is sending a message</summary>
            /// <param name="message" type="Object">Message</param>
            /// <param name="clientGuid" type="String">Message client guid</param>
            var _this = this;

            if (message.UserFromId != this.opts.userId) {
                // the message did not came from myself. Better erase the typing signal
                _this.removeTypingSignal();
            }

            // takes a jQuery element and replace it's content that seems like an URL with an
            // actual link or e-mail
            function linkify($element) {
                var inputText = $element.html();
                var replacedText, replacePattern1, replacePattern2, replacePattern3;

                //URLs starting with http://, https://, or ftp://
                replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
                replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

                //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

                //Change email addresses to mailto:: links.
                replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
                replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

                return $element.html(replacedText);
            }

            function emotify($element) {
                var inputText = $element.html();
                var replacedText = inputText;

                var emoticons = [
                    { pattern: ":-\)", cssClass: "happy" },
                    { pattern: ":\)", cssClass: "happy" },
                    { pattern: "=\)", cssClass: "happy" },
                    { pattern: ":-D", cssClass: "very-happy" },
                    { pattern: ":D", cssClass: "very-happy" },
                    { pattern: "=D", cssClass: "very-happy" },
                    { pattern: ":-\(", cssClass: "sad" },
                    { pattern: ":\(", cssClass: "sad" },
                    { pattern: "=\(", cssClass: "sad" },
                    { pattern: ":-\|", cssClass: "wary" },
                    { pattern: ":\|", cssClass: "wary" },
                    { pattern: "=\|", cssClass: "wary" },
                    { pattern: ":-O", cssClass: "astonished" },
                    { pattern: ":O", cssClass: "astonished" },
                    { pattern: "=O", cssClass: "astonished" },
                    { pattern: ":-P", cssClass: "tongue" },
                    { pattern: ":P", cssClass: "tongue" },
                    { pattern: "=P", cssClass: "tongue" }
                ];

                for (var i = 0; i < emoticons.length; i++) {
                    replacedText = replacedText.replace(emoticons[i].pattern, "<span class='" + emoticons[i].cssClass + "'></span>");
                }

                return $element.html(replacedText);
            }

            if (message.ClientGuid && $("p[data-val-client-guid='" + message.ClientGuid + "']").length) {
                // in this case, this message is comming from the server AND the current user POSTED the message.
                // so he/she already has this message in the list. We DO NOT need to add the message.
                $("p[data-val-client-guid='" + message.ClientGuid + "']").removeClass("temp-message").removeAttr("data-val-client-guid");
            } else {
                var $messageP = $("<p/>").text(message.Message);
                if (clientGuid)
                    $messageP.attr("data-val-client-guid", clientGuid).addClass("temp-message");

                linkify($messageP);
                emotify($messageP);

                // gets the last message to see if it's possible to just append the text
                var $lastMessage = $("div.chat-message:last", _this.$messagesWrapper);
                if ($lastMessage.length && $lastMessage.attr("data-val-user-from") == message.UserFromId) {
                    // we can just append text then
                    $messageP.appendTo($(".chat-text-wrapper", $lastMessage));
                }
                else {
                    // in this case we need to create a whole new message
                    var $chatMessage = $("<div/>").addClass("chat-message").attr("data-val-user-from", message.UserFromId);
                    $chatMessage.appendTo(_this.$messagesWrapper);

                    var $gravatarWrapper = $("<div/>").addClass("chat-gravatar-wrapper").appendTo($chatMessage);
                    var $textWrapper = $("<div/>").addClass("chat-text-wrapper").appendTo($chatMessage);

                    // add text
                    $messageP.appendTo($textWrapper);

                    // add image
                    var $img = $("<img/>").addClass("profile-picture").appendTo($gravatarWrapper);
                    _this.opts.adapter.server.getUserInfo(message.UserFromId, function (user) {
                        $img.attr("src", decodeURI(user.ProfilePictureUrl));
                    });
                }

                // scroll to the bottom
                _this.$messagesWrapper.scrollTop(_this.$messagesWrapper[0].scrollHeight);
            }
        },

        sendTypingSignal: function () {
            /// <summary>Sends a typing signal to the other user</summary>
            var _this = this;
            _this.opts.adapter.server.sendTypingSignal(_this.opts.roomId, _this.opts.conversationId, _this.opts.otherUserId);
        },

        showTypingSignal: function (user) {
            /// <summary>Adds a typing signal to this window. It means the other user is typing</summary>
            /// <param FullName="user" type="Object">the other user info</param>
            var _this = this;
            if (_this.$typingSignal)
                _this.$typingSignal.remove();
            _this.$typingSignal = $("<p/>").addClass("typing-signal").text(user.Name + _this.opts.typingText);
            _this.$messagesWrapper.append(_this.$typingSignal);
            if (_this.typingSignalTimeout)
                clearTimeout(_this.typingSignalTimeout);
            _this.typingSignalTimeout = setTimeout(function () {
                _this.removeTypingSignal();
            }, 5000);
        },

        removeTypingSignal: function () {
            /// <summary>Remove the typing signal, if it exists</summary>
            var _this = this;
            if (_this.$typingSignal)
                _this.$typingSignal.remove();
            if (_this.typingSignalTimeout)
                clearTimeout(_this.typingSignalTimeout);
        },

        sendMessage: function (messageText) {
            /// <summary>Sends a message to the other user</summary>
            /// <param FullName="messageText" type="String">Message being sent</param>
            var _this = this;

            var generateGuidPart = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };

            var clientGuid = (generateGuidPart() + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + generateGuidPart() + generateGuidPart());
            _this.addMessage({
                UserFromId: _this.opts.userId,
                Message: messageText
            }, clientGuid);

            _this.opts.adapter.server.sendMessage(_this.opts.roomId, _this.opts.conversationId, _this.opts.otherUserId, messageText, clientGuid);
        },

        playSound: function (filename) {
            /// <summary>Plays a notification sound</summary>
            /// <param FullName="fileFullName" type="String">The file path without extension</param>
            var $soundContainer = $("#soundContainer");
            if (!$soundContainer.length)
                $soundContainer = $("<div>").attr("id", "soundContainer").appendTo($("body"));
            $soundContainer.html('<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>');
        },

        focus: function() {
            var _this = this;
            _this.$textBox.focus();
        }
    };

    $.fn.messageBoard = function (options) {
        if (this.length) {
            this.each(function () {
                var data = new MessageBoard(this, options);
                data.init();
                $(this).data('messageBoard', data);
            });
        }
        return this;
    };

})(jQuery);
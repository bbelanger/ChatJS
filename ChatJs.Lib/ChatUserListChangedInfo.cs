using System.Collections.Generic;

namespace ChatJs.Lib
{
    public class ChatUserListChangedInfo
    {
        public ChatUserListChangedInfo()
        {
            this.UserList = new List<ChatUserInfo>();
        }

        public int? RoomId { get; set; }
        public int? ConversationId { get; set; }

        public List<ChatUserInfo> UserList { get; set; }
    }
}
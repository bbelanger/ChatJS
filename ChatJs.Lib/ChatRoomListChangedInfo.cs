using System.Collections.Generic;

namespace ChatJs.Lib
{
    public class ChatRoomListChangedInfo
    {
        public ChatRoomListChangedInfo()
        {
            this.Rooms = new List<ChatRoomInfo>();
        }

        public List<ChatRoomInfo> Rooms;
    }
}
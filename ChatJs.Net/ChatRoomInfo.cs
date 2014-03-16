using System;

namespace ChatJs.Lib
{
    /// <summary>
    /// Information about a chat user
    /// </summary>
    public class ChatRoomInfo
    {
        /// <summary>
        /// The room id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The room display name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Number of online users right now
        /// </summary>
        public int UsersOnline { get; set; }
    }
}
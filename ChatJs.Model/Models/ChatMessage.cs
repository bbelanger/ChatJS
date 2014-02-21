#region

using System;

#endregion

namespace ChatJs.Model.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int RoomId { get; set; }

        public int ConversationId { get; set; }

        public int UserFromId { get; set; }

        public User UserFrom { get; set; }

        public string Message { get; set; }

        public DateTime DateTime { get; set; }

        public virtual ChatRoom ChatRoom { get; set; }

        public virtual User User { get; set; }

        public int UserId { get; set; }
    }
}
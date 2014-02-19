using System;
using System.Collections.Generic;

namespace ChatJs.Model.Models
{
    public partial class ChatMessage
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int ConversationId { get; set; }
        public int UserFromId { get; set; }
        public string Body { get; set; }
        public System.DateTime DateTime { get; set; }
        public virtual ChatRoom ChatRoom { get; set; }
        public virtual User User { get; set; }
    }
}

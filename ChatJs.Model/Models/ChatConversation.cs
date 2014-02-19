using System;
using System.Collections.Generic;

namespace ChatJs.Model.Models
{
    public partial class ChatConversation
    {
        public ChatConversation()
        {
            this.ChatUserConversations = new List<ChatUserConversation>();
        }

        public int Id { get; set; }
        public System.DateTime StartDateTime { get; set; }
        public int RoomId { get; set; }
        public virtual ChatRoom ChatRoom { get; set; }
        public virtual ICollection<ChatUserConversation> ChatUserConversations { get; set; }
    }
}

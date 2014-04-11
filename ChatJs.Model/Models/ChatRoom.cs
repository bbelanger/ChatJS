using System.Collections.Generic;

namespace ChatJs.Model.Models
{
    public class ChatRoom
    {
        public ChatRoom()
        {
            this.ChatConversations = new List<ChatConversation>();
            this.ChatMessages = new List<ChatMessage>();
            this.ChatRoomUsers = new List<ChatRoomUser>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<ChatConversation> ChatConversations { get; set; }
        public virtual ICollection<ChatMessage> ChatMessages { get; set; }
        public virtual ICollection<ChatRoomUser> ChatRoomUsers { get; set; }
    }
}
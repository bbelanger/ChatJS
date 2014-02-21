//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ChatJsMvcSample.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class ChatRoom
    {
        public ChatRoom()
        {
            this.ChatConversations = new HashSet<ChatConversation>();
            this.ChatMessages = new HashSet<ChatMessage>();
            this.ChatRoomUsers = new HashSet<ChatRoomUser>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    
        public virtual ICollection<ChatConversation> ChatConversations { get; set; }
        public virtual ICollection<ChatMessage> ChatMessages { get; set; }
        public virtual ICollection<ChatRoomUser> ChatRoomUsers { get; set; }
    }
}
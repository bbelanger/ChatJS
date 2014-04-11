namespace ChatJs.Model.Models
{
    public class ChatUserConversation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ConversationId { get; set; }
        public virtual ChatConversation ChatConversation { get; set; }
        public virtual User User { get; set; }
    }
}
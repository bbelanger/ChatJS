using System.Data.Entity;
using ChatJs.Model.Models.Mapping;

namespace ChatJs.Model.Models
{
    public class ChatjsContext : DbContext
    {
        static ChatjsContext()
        {
            Database.SetInitializer<ChatjsContext>(null);
        }

        public ChatjsContext()
            : base("chatjs.admin")
        {
        }

        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatRoomUser> ChatRoomUsers { get; set; }
        public DbSet<ChatUserConversation> ChatUserConversations { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Configurations.Add(new ChatConversationMap());
            modelBuilder.Configurations.Add(new ChatMessageMap());
            modelBuilder.Configurations.Add(new ChatRoomMap());
            modelBuilder.Configurations.Add(new ChatRoomUserMap());
            modelBuilder.Configurations.Add(new ChatUserConversationMap());
            modelBuilder.Configurations.Add(new UserMap());
        }
    }
}
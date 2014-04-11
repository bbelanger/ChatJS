using System.Data.Entity.ModelConfiguration;

namespace ChatJs.Model.Models.Mapping
{
    public class ChatConversationMap : EntityTypeConfiguration<ChatConversation>
    {
        public ChatConversationMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("ChatConversation");

            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.StartDateTime).HasColumnName("StartDateTime");
            this.Property(t => t.RoomId).HasColumnName("RoomId");

            // Relationships
            this.HasRequired(t => t.ChatRoom)
                .WithMany(t => t.ChatConversations)
                .HasForeignKey(d => d.RoomId);
        }
    }
}
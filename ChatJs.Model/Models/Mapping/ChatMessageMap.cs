using System.Data.Entity.ModelConfiguration;

namespace ChatJs.Model.Models.Mapping
{
    public class ChatMessageMap : EntityTypeConfiguration<ChatMessage>
    {
        public ChatMessageMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            this.Property(t => t.Message)
                .IsRequired();

            // Table & Column Mappings
            this.ToTable("ChatMessage");

            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.RoomId).HasColumnName("RoomId");
            this.Property(t => t.ConversationId).HasColumnName("ConversationId");
            this.Property(t => t.Message).HasColumnName("Body");
            this.Property(t => t.DateTime).HasColumnName("DateTime");

            // Relationships
            this.HasRequired(t => t.ChatRoom)
                .WithMany(t => t.ChatMessages)
                .HasForeignKey(d => d.RoomId);

            this.HasRequired(t => t.UserTo)
                .WithMany(t => t.ChatMessagesImUserTo)
                .HasForeignKey(d => d.UserToId);

            this.HasRequired(t => t.UserFrom)
                .WithMany(t => t.ChatMessagesImUserFrom)
                .HasForeignKey(d => d.UserFromId)
                .WillCascadeOnDelete(false);
        }
    }
}
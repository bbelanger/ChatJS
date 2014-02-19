using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace ChatJs.Model.Models.Mapping
{
    public class ChatMessageMap : EntityTypeConfiguration<ChatMessage>
    {
        public ChatMessageMap()
        {
            // Primary Key
            this.HasKey(t => new { t.Id, t.RoomId, t.ConversationId, t.UserFromId, t.Body, t.DateTime });

            // Properties
            this.Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.RoomId)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.ConversationId)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.UserFromId)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            this.Property(t => t.Body)
                .IsRequired();

            // Table & Column Mappings
            this.ToTable("ChatMessage");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.RoomId).HasColumnName("RoomId");
            this.Property(t => t.ConversationId).HasColumnName("ConversationId");
            this.Property(t => t.UserFromId).HasColumnName("UserFromId");
            this.Property(t => t.Body).HasColumnName("Body");
            this.Property(t => t.DateTime).HasColumnName("DateTime");

            // Relationships
            this.HasRequired(t => t.ChatRoom)
                .WithMany(t => t.ChatMessages)
                .HasForeignKey(d => d.RoomId);
            this.HasRequired(t => t.User)
                .WithMany(t => t.ChatMessages)
                .HasForeignKey(d => d.UserFromId);

        }
    }
}

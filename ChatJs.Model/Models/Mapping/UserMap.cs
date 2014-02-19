#region

using System.Data.Entity.ModelConfiguration;

#endregion

namespace ChatJs.Model.Models.Mapping
{
    public class UserMap : EntityTypeConfiguration<User>
    {
        public UserMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.UserName)
                .IsRequired()
                .HasMaxLength(100);

            this.Property(t => t.DisplayName)
                .HasMaxLength(50);

            this.Property(t => t.PasswordHash)
                .IsRequired()
                .HasMaxLength(200);


            // Table & Column Mappings
            this.ToTable("User");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.DisplayName).HasColumnName("DisplayName");
            this.Property(t => t.PasswordHash).HasColumnName("PasswordHash");
        }
    }
}
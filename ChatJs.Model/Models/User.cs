#region

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data.Entity;
using Microsoft.AspNet.Identity.EntityFramework;

#endregion

namespace ChatJs.Model.Models
{
    public class User : IdentityUser<int, UserLogin, UserRole, UserClaim>
    {
        public User()
        {
            this.ChatUserConversations = new List<ChatUserConversation>();
            this.ChatRoomUsers = new Collection<ChatRoomUser>();
            this.ChatMessagesImUserTo = new Collection<ChatMessage>();
            this.ChatMessagesImUserFrom = new Collection<ChatMessage>();
        }

        public string DisplayName { get; set; }

        public ICollection<ChatUserConversation> ChatUserConversations { get; set; }

        public ICollection<ChatRoomUser> ChatRoomUsers { get; set; }

        public ICollection<ChatMessage> ChatMessagesImUserTo { get; set; }

        public ICollection<ChatMessage> ChatMessagesImUserFrom { get; set; }
    }


    public class IdentityRole : IdentityRole<int, UserRole>
    {
        public IdentityRole()
        {
        }

        public IdentityRole(string name) : this()
        {
            this.Name = name;
        }
    }

    public class UserRole : IdentityUserRole<int>
    {
        public int Id { get; set; }
    }

    public class UserClaim : IdentityUserClaim<int>
    {
    }

    public class UserLogin : IdentityUserLogin<int>
    {
        public int Id { get; set; }
    }

    public class UserStore : UserStore<User, IdentityRole, int, UserLogin, UserRole, UserClaim>
    {
        public UserStore(DbContext context)
            : base(context)
        {
        }
    }

    public class RoleStore : RoleStore<IdentityRole, int, UserRole>
    {
        public RoleStore(DbContext context)
            : base(context)
        {
        }
    }
}
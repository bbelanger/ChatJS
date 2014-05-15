#region

using ChatJs.Model;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;

#endregion

namespace ChatJs.Admin.Code
{
    public class ChatJsUserManager : UserManager<User, int>
    {
        public ChatJsUserManager(ChatJsUserStore store)
            : base(store)
        {
            this.Users = store;
            this.UserValidator = new UserValidator<User, int>(this) {AllowOnlyAlphanumericUserNames = false};
        }

        public ChatJsUserStore Users { get; private set; }
    }
}
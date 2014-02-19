#region

using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

#endregion

namespace ChatJs.Model
{
    public class ChatJsUserStore : IUserPasswordStore<User, int>,
        IUserSecurityStampStore<User, int>
    {
        private readonly ChatjsContext _dbContext;
        private readonly UserStore _defaultUserStore = new UserStore(new ChatjsContext());

        public ChatJsUserStore(ChatjsContext dbContext)
        {
            if (dbContext == null) throw new ArgumentNullException("dbContext");
            this._dbContext = dbContext;
        }

        public Task<string> GetPasswordHashAsync(User user)
        {
            var task = this._defaultUserStore.GetPasswordHashAsync(user);
            return task;
        }

        public Task<bool> HasPasswordAsync(User user)
        {
            var task = this._defaultUserStore.HasPasswordAsync(user);
            return task;
        }

        public Task SetPasswordHashAsync(User user, string passwordHash)
        {
            var task = this._defaultUserStore.SetPasswordHashAsync(user, passwordHash);
            return task;
        }

        public Task<string> GetSecurityStampAsync(User user)
        {
            var task = this._defaultUserStore.GetSecurityStampAsync(user);
            return task;
        }

        public Task SetSecurityStampAsync(User user, string stamp)
        {
            var task = this._defaultUserStore.SetSecurityStampAsync(user, stamp);
            return task;
        }

        public Task CreateAsync(User user)
        {
            this._dbContext.Users.Add(user);
            this._dbContext.Configuration.ValidateOnSaveEnabled = false;
            return this._dbContext.SaveChangesAsync();
        }

        public Task DeleteAsync(User user)
        {
            this._dbContext.Users.Remove(user);
            this._dbContext.Configuration.ValidateOnSaveEnabled = false;
            return this._dbContext.SaveChangesAsync();
        }
        
        public Task<User> FindByIdAsync(int userId)
        {
            return this._dbContext.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
        }

        public Task<User> FindByNameAsync(string userName)
        {
            return this._dbContext.Users.Where(u => u.UserName.ToLower() == userName.ToLower()).FirstOrDefaultAsync();
        }

        public Task UpdateAsync(User user)
        {
            var existingUser = this._dbContext.Users.Find(user.Id);
            existingUser.UserName = user.UserName;
            existingUser.DisplayName = user.DisplayName;

            this._dbContext.Configuration.ValidateOnSaveEnabled = false;
            return this._dbContext.SaveChangesAsync();
        }

        public void Dispose()
        {
            this._defaultUserStore.Dispose();
        }
    }
}
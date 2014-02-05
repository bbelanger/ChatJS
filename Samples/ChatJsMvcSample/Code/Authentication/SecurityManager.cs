using System;
using System.Data.Entity;
using System.Data.Objects;
using System.Linq;
using System.Web;
using System.Web.Security;
using ChatJsMvcSample.Code.Authentication.Principals;
using ChatJsMvcSample.Models;

namespace ChatJsMvcSample.Code.Authentication
{
    public class SecurityManager
    {
        /// <summary>
        /// Set the current user principal and identity
        /// </summary>
        /// <param name="httpContext"></param>
        public static void SetPrincipal(HttpContextBase httpContext)
        {
            Principal principal = null;

            if (httpContext.Request.IsAuthenticated)
            {
                var identity = (FormsIdentity)httpContext.User.Identity;

                try
                {
                    var userProfile = SecurityTokenHelper.FromString(((FormsIdentity)identity).Ticket.UserData).UserData;
                    // UserHelper.UpdateLastActiveOn(userProfile);
                    principal = new AuthenticatedPrincipal(identity, userProfile);
                }
                catch
                {
                    //TODO: Log an exception
                    FormsAuthentication.SignOut();
                    principal = new AnonymousPrincipal(new GuestIdentity());
                }
            }
            else
                principal = new AnonymousPrincipal(new GuestIdentity());

            httpContext.User = principal;
        }

        /// <summary>
        /// Logs an user in.
        /// </summary>
        /// <param name="cookieCollection">
        /// Cookie collection that is going to hold an encrypted cookie with informations about the user.
        /// </param>
        /// <param name="loginModel">
        /// Model containing login informations such as practice-name, user-name and password.
        /// </param>
        /// <param name="dbUserSet">
        /// Object set used to get informations about the user.
        /// No data will be saved to this object set.
        /// </param>
        /// <param name="loggedInUser">
        /// Out parameter returning the database User object representing the logged in user, only if the
        /// login succeded. Otherwise null.
        /// </param>
        /// <returns>Returns whether the login succeded or not.</returns>
        public static bool Login(HttpCookieCollection cookieCollection, SigninViewModel loginModel, DbSet<User> dbUserSet, out User loggedInUser, DateTime utcNow)
        {
            loggedInUser = null;

            try
            {
                string securityToken;
                loggedInUser = AuthenticateUser(loginModel.Email, loginModel.Password, loginModel.RoomName, dbUserSet, out securityToken);

                if (loggedInUser != null)
                {
                    var expiryDate = utcNow.AddYears(1);
                    var ticket = new FormsAuthenticationTicket(
                        1,
                        loginModel.Email,
                        utcNow,
                        expiryDate,
                        true,
                        securityToken,
                        FormsAuthentication.FormsCookiePath);

                    var encryptedTicket = FormsAuthentication.Encrypt(ticket);
                    var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket)
                    {
                        Expires = loginModel.RememberMe ? utcNow.AddYears(1) : DateTime.MinValue
                    };

                    cookieCollection.Add(cookie);

                    return true;
                }
            }
            catch
            {
                // Any excpetion will be ignored here, and the login will just fail.
            }

            // add log information about this exception
            FormsAuthentication.SignOut();
            return false;
        }

        /// <summary>
        /// Authenticates the user, given it's login informations.
        /// </summary>
        /// <param name="roomName"></param>
        /// <param name="dbUserSet"></param>
        /// <param name="userEMail"> </param>
        /// <param name="password"> </param>
        /// <param name="securityTokenString">String representing the identity of the authenticated user.</param>
        /// <returns></returns>
        public static User AuthenticateUser(String userEMail, String password, string roomName, DbSet<User> dbUserSet, out string securityTokenString)
        {
            // Note: this method was setting the user.LastActiveOn property, but now the caller must do this.
            // This is because it is not allowed to use DateTime.Now, because this makes the value not mockable.

            securityTokenString = null;

            var loggedInUser = dbUserSet.FirstOrDefault(m => m.Email == userEMail);

            if (loggedInUser == null)
                return null;

            // comparing password
            var passwordHash = CipherHelper.Hash(password, loggedInUser.PasswordSalt);
            if (loggedInUser.PasswordHash != passwordHash)
                return null;

            var securityToken = new SecurityToken
            {
                Salt = new Random().Next(0, 2000),
                UserData = new UserData
                {
                    Id = loggedInUser.Id,
                    Email = loggedInUser.Email,
                    Name = loggedInUser.DisplayName,
                    RoomName = roomName
                }
            };

            securityTokenString = SecurityTokenHelper.ToString(securityToken);

            return loggedInUser;
        }
    }
}
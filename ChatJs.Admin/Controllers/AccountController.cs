#region

using System.Threading.Tasks;
using System.Web.Mvc;
using ChatJs.Admin.Models;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

#endregion

namespace ChatJs.Admin.Controllers
{
    public class AccountController : ChatJsController
    {
        [HttpGet]
        public ActionResult Signin()
        {
            return this.View();
        }

        /// <summary>
        ///     Joins the chat
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> Signin(SigninViewModel model)
        {
            if (this.ModelState.IsValid)
            {
                var user = await this.UserManager.FindAsync(model.UserName, model.Password);

                if (user != null)
                {
                    await this.SignInAsync(user, model.RememberMe);
                    return this.RedirectToAction("Index", "Dashboard");
                }
                this.ModelState.AddModelError("EmailAddress", "Could not find a user with the given credentials");
            }
            return this.View(model);
        }

        private async Task SignInAsync(User user, bool isPersistent)
        {
            this.AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            var identity =
                await this.UserManager.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie);
            this.AuthenticationManager.SignIn(new AuthenticationProperties {IsPersistent = isPersistent}, identity);
        }

        /// <summary>
        ///     Leaves the chat
        /// </summary>
        public ActionResult Signout(string userName, string email)
        {
            this.AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            return this.RedirectToAction("Index", "Dashboard");
        }

        [HttpGet]
        public async Task<ActionResult> Signon()
        {
            return this.View();
        }

        [HttpPost]
        public async Task<ActionResult> Signon(UserViewModel model)
        {
            if (model.Id.HasValue)
            {
                this.ModelState.Remove("Password");
                this.ModelState.Remove("ConfirmPassword");
            }

            if (this.ModelState.IsValid)
            {
                if (model.Id.HasValue)
                {
                    // it's an existing user
                    var identity = await this.UserManager.UpdateAsync(
                        new User
                        {
                            Id = model.Id.Value,
                            UserName = model.UserName,
                            Email = model.EMail,
                            DisplayName = model.DisplayName
                        });

                    if (identity.Succeeded)
                        return this.RedirectToAction("Index", "Dashboard");

                    foreach (var error in identity.Errors)
                        this.ModelState.AddModelError("EMail", error);
                }
                else
                {
                    // it's a new user
                    var identity = await this.UserManager.CreateAsync(new User
                    {
                        UserName = model.UserName,
                        Email = model.EMail,
                        DisplayName = model.DisplayName
                    }, model.Password);

                    if (identity.Succeeded)
                        return this.RedirectToAction("Index", "Dashboard");

                    foreach (var error in identity.Errors)
                        this.ModelState.AddModelError("EMail", error);
                }
            }

            return this.View(model);
        }
    }
}
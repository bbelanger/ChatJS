#region

using System.Web;
using System.Web.Mvc;
using ChatJs.Admin.Code;
using ChatJs.Admin.Models;
using ChatJs.Lib;
using ChatJs.Model;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

#endregion

namespace ChatJs.Admin.Controllers
{
    public class ChatJsController : Controller
    {
        public ChatJsController()
        {
            this.Db = new ChatjsContext();
            this.UserManager = new ChatJsUserManager(new ChatJsUserStore(this.Db));
        }

        protected IAuthenticationManager AuthenticationManager
        {
            get { return this.HttpContext.GetOwinContext().Authentication; }
        }

        public ChatJsUserManager UserManager { get; set; }

        public ChatjsContext Db { get; set; }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            base.OnActionExecuted(filterContext);
            var id = this.User.Identity.GetUserId();
            if (id != null)
            {
                var currentUser = this.UserManager.FindById(int.Parse(id));
                if (currentUser == null)
                {
                    this.AuthenticationManager.SignOut();
                    return;
                }

                this.ViewBag.User = new UserViewModel
                {
                    Id = currentUser.Id,
                    UserName = currentUser.UserName,
                    DisplayName = currentUser.DisplayName,
                    EMail = currentUser.DisplayName,
                    ProfilePictureUrl =
                        GravatarHelper.GetGravatarUrl(GravatarHelper.GetGravatarHash(currentUser.Email),
                            GravatarHelper.Size.S16)
                };
            }
        }
    }
}
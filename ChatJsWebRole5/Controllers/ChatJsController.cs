using System.Web.Mvc;
using ChatJs.Admin.Code;
using ChatJs.Admin.Models;
using ChatJs.Lib;
using ChatJs.Model;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;

namespace ChatJs.Admin.Controllers
{
    public class ChatJsController : Controller
    {
        public ChatJsController()
        {
            this.Db = new ChatjsContext();
        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            base.OnActionExecuted(filterContext);
            var id = this.User.Identity.GetUserId();
            if (id != null)
            {
                var currentUser = this.Db.Users.Find(int.Parse(id));
                this.ViewBag.User = new UserViewModel()
                {
                    Id = currentUser.Id,
                    UserName = currentUser.UserName,
                    DisplayName = currentUser.DisplayName,
                    EMail = currentUser.DisplayName,
                    ProfilePictureUrl = GravatarHelper.GetGravatarUrl(GravatarHelper.GetGravatarHash(currentUser.Email), GravatarHelper.Size.S16)
                };
            }
        }

        public ChatjsContext Db { get; set; }
    }
}
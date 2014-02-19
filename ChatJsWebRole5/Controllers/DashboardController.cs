#region

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
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
    [Authorize]
    public class DashboardController : ChatJsController
    {
        public DashboardController()
        {
            this.UserManager = new ChatJsUserManager(new ChatJsUserStore(this.Db));
        }

        public ChatJsUserManager UserManager { get; private set; }


        public ActionResult Index()
        {
            var viewModel = new IndexViewModel
            {
                Rooms = this.Db.ChatRooms.Select(m => new RoomViewModel
                {
                    Id = m.Id,
                    RoomName = m.Name,
                    Description = m.Description,
                    RoomUsersCount = m.ChatRoomUsers.Count
                }).ToList(),
                Users = this.Db.Users.Select(m => new UserViewModel
                {
                    Id = m.Id,
                    DisplayName = m.DisplayName,
                    EMail = m.Email
                }).ToList()
            };

            // refine data
            viewModel.Users.ForEach(u =>
            {
                u.ProfilePictureUrl = GravatarHelper.GetGravatarUrl(GravatarHelper.GetGravatarHash(u.EMail), GravatarHelper.Size.S16);
            });

            return this.View(viewModel);
        }
    }
}
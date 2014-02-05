using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using ChatJs.Net;
using System.Linq;
using ChatJsMvcSample.Code.Authentication;
using ChatJsMvcSample.Code.Authentication.Principals;
using ChatJsMvcSample.Code.LongPolling.Chat;
using ChatJsMvcSample.Code.SignalR;
using ChatJsMvcSample.Models;
using ChatRoom = ChatJsMvcSample.Models.ChatRoom;

namespace ChatJsMvcSample.Controllers
{
    public class HomeController : Controller
    {
        readonly ChatJsEntities db = new ChatJsEntities();

        /// <summary>
        /// Fills up the current user information
        /// </summary>
        /// <param name="filterContext"></param>
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            
        }

        public ActionResult Index()
        {
            // if the user is authenticated, he/she won't go to the dashboard, he'll go 
            if (this.Request.IsAuthenticated)
                return this.RedirectToAction("Meeting");

            var viewModel = new IndexViewModel()
                {
                    Rooms = this.db.ChatRooms.Select(m => new RoomViewModel()
                        {
                            Id = m.Id,
                            RoomName = m.Name,
                            Description = m.Description,
                            RoomUsersCount = m.ChatRoomUsers.Count
                        }).ToList(),
                    Users = this.db.Users.Select(m => new UserViewModel()
                        {
                            Id = m.Id,
                            DisplayName = m.DisplayName,
                            EMail = m.Email
                        }).ToList()
                };

            return this.View(viewModel);
        }

        [HttpGet]
        public ActionResult Signin()
        {
            return this.View();
        }

        /// <summary>
        /// Joins the chat
        /// </summary>
        [HttpPost]
        public ActionResult Signin(SigninViewModel viewModel)
        {
            User user;
            if (!SecurityManager.Login(this.Response.Cookies, viewModel, this.db.Users, out user, DateTime.UtcNow))
            {
                this.ModelState.Clear();
                this.ModelState.AddModelError("EmailAddress", "Could not find a user with the given credentials");
                return this.View(viewModel);
            }

            // the user sucessfully logged in
            return this.RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult EditRoom(int? id)
        {
            RoomViewModel viewModel;
            if (id.HasValue)
            {
                var existingRoom = this.db.ChatRooms.Find(id);
                if (existingRoom == null)
                    throw new Exception("Cannot edit room. Room not found. Room id: " + id);

                viewModel = new RoomViewModel()
                {
                    Id = existingRoom.Id,
                    RoomName = existingRoom.Name,
                    Description = existingRoom.Description
                };
            }
            else
                viewModel = new RoomViewModel();

            foreach (var user in db.Users)
            {
                viewModel.RoomUsers.Add(new RoomUserViewModel()
                    {
                        UserId = user.Id,
                        UserDisplayName = user.DisplayName,
                        IsEnlisted = id.HasValue && (this.db.ChatRoomUsers.Any(m => m.RoomId == id && m.UserId == user.Id))
                    });
            }

            return this.View(viewModel);
        }

        [HttpPost]
        public ActionResult EditRoom(RoomViewModel viewModel)
        {
            if ((!viewModel.Id.HasValue && !string.IsNullOrEmpty(viewModel.RoomName) && db.ChatRooms.Any(m => m.Name == viewModel.RoomName))
                || (viewModel.Id.HasValue && db.ChatRooms.Any(m => m.Name == viewModel.RoomName && m.Id != viewModel.Id)))
                this.ModelState.AddModelError("RoomName", "There's already a room with the given name");

            if (this.ModelState.IsValid)
            {
                ChatRoom room;
                if (viewModel.Id.HasValue)
                {
                    // it's an existing room
                    room = this.db.ChatRooms.Find(viewModel.Id);
                    if (room == null)
                        throw new Exception("Cannot edit room. Room not found. Room id: " + viewModel);

                    room.Name = viewModel.RoomName;
                    room.Description = viewModel.Description;
                }
                else
                {
                    room = this.db.ChatRooms.Add(new ChatRoom()
                    {
                        Name = viewModel.RoomName,
                        Description = viewModel.Description
                    });

                }

                // update users in room
                foreach (var roomUser in viewModel.RoomUsers)
                {
                    if (roomUser.IsEnlisted)
                    {
                        // the user is in the room
                        if (!room.ChatRoomUsers.Any(m => m.UserId == roomUser.UserId))
                        {
                            room.ChatRoomUsers.Add(new ChatRoomUser()
                                {
                                    UserId = roomUser.UserId
                                });
                        }
                    }

                    else
                    {
                        var existingROomUser = room.ChatRoomUsers.FirstOrDefault(m => m.UserId == roomUser.UserId);
                        if (existingROomUser != null)
                            this.db.ChatRoomUsers.Remove(existingROomUser);
                    }
                }

                this.db.SaveChanges();
                return this.RedirectToAction("Index");
            }

            return this.View(viewModel);
        }

        [HttpGet]
        public ActionResult EditUser(int? id)
        {
            UserViewModel viewModel;
            if (id.HasValue)
            {
                var existingUser = this.db.Users.Find(id);
                if (existingUser == null)
                    throw new Exception("Cannot edit user. User not found. User id: " + id);

                viewModel = new UserViewModel()
                    {
                        DisplayName = existingUser.DisplayName,
                        EMail = existingUser.Email,
                        Id = existingUser.Id,
                        // it's impossible to retrieve the actual password as it's hashed and salted
                    };
            }
            else
                viewModel = null;

            return this.View(viewModel);
        }

        [HttpPost]
        public ActionResult EditUser(UserViewModel viewModel)
        {
            if ((!viewModel.Id.HasValue && !string.IsNullOrEmpty(viewModel.DisplayName) && db.Users.Any(m => m.DisplayName == viewModel.DisplayName))
            || (viewModel.Id.HasValue && db.Users.Any(m => m.DisplayName == viewModel.DisplayName && m.Id != viewModel.Id)))
                this.ModelState.AddModelError("DisplayName", "There's already a user with the given display name");


            if ((!viewModel.Id.HasValue && !string.IsNullOrEmpty(viewModel.EMail) && db.Users.Any(m => m.Email == viewModel.EMail))
            || (viewModel.Id.HasValue && db.Users.Any(m => m.Email == viewModel.EMail && m.Id != viewModel.Id)))
                this.ModelState.AddModelError("DisplayName", "There's already a user with the given e-mail");

            if (viewModel.Id.HasValue)
                this.ModelState.Remove("Password");

            if (this.ModelState.IsValid)
            {
                if (viewModel.Id.HasValue)
                {
                    // it's an existing user
                    var existingUser = this.db.Users.Find(viewModel.Id);
                    if (existingUser == null)
                        throw new Exception("Cannot edit user. User not found. User id: " + viewModel);

                    existingUser.DisplayName = viewModel.DisplayName;
                    existingUser.Email = viewModel.EMail;
                }
                else
                {
                    // it's a new user
                    var passwordSalt = CipherHelper.GenerateSalt();
                    var passwordHash = CipherHelper.Hash(viewModel.Password, passwordSalt);

                    this.db.Users.Add(new User()
                    {
                        DisplayName = viewModel.DisplayName,
                        PasswordHash = passwordHash,
                        PasswordSalt = passwordSalt,
                        Email = viewModel.EMail
                    });
                }

                this.db.SaveChanges();

                return this.RedirectToAction("Index");
            }

            return this.View(viewModel);
        }

        [HttpGet]
        public ActionResult ChangePassword(int id)
        {
            var existingUser = this.db.Users.Find(id);
            if (existingUser == null)
                throw new Exception("Cannot change user password. User not found. User id: " + id);

            return this.View(new UserViewModel()
                {
                    Id = existingUser.Id
                });
        }

        [HttpPost]
        public ActionResult ChangePassword(UserViewModel viewModel)
        {
            this.ModelState.Remove("DisplayName");
            this.ModelState.Remove("EMail");

            if (this.ModelState.IsValid)
            {
                var existingUser = this.db.Users.Find(viewModel.Id);
                if (existingUser == null)
                    throw new Exception("Cannot change user password. User not found. User id: " + viewModel.Id);

                var passwordSalt = CipherHelper.GenerateSalt();
                var passwordHash = CipherHelper.Hash(viewModel.Password, passwordSalt);

                existingUser.PasswordHash = passwordHash;
                existingUser.PasswordSalt = passwordSalt;

                this.db.SaveChanges();
                return this.RedirectToAction("Index");
            }

            return this.View(viewModel);
        }

        /// <summary>
        /// Leaves the chat
        /// </summary>
        public ActionResult LeaveChat(string userName, string email)
        {
            FormsAuthentication.SignOut();
            return this.RedirectToAction("Index");
        }

        public ActionResult Meeting()
        {
            return this.View();
        }
    }
}
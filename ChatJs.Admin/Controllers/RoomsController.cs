using System;
using System.Linq;
using System.Web.Mvc;
using ChatJs.Admin.Models;
using ChatJs.Model.Models;

namespace ChatJs.Admin.Controllers
{
    [Authorize]
    public class RoomsController : ChatJsController
    {
        [HttpGet]
        public ActionResult EditRoom(int? id)
        {
            RoomViewModel viewModel;
            if (id.HasValue)
            {
                var existingRoom = this.Db.ChatRooms.Find(id);
                if (existingRoom == null)
                    throw new Exception("Cannot edit room. Room not found. Room id: " + id);

                viewModel = new RoomViewModel
                {
                    Id = existingRoom.Id,
                    RoomName = existingRoom.Name,
                    Description = existingRoom.Description
                };
            }
            else
                viewModel = new RoomViewModel();

            return this.View(viewModel);
        }

        [HttpPost]
        public ActionResult EditRoom(RoomViewModel viewModel)
        {
            if ((!viewModel.Id.HasValue && !string.IsNullOrEmpty(viewModel.RoomName) &&
                 this.Db.ChatRooms.Any(m => m.Name == viewModel.RoomName))
                ||
                (viewModel.Id.HasValue &&
                 this.Db.ChatRooms.Any(m => m.Name == viewModel.RoomName && m.Id != viewModel.Id)))
                this.ModelState.AddModelError("RoomName", "There's already a room with the given name");

            if (this.ModelState.IsValid)
            {
                ChatRoom room;
                if (viewModel.Id.HasValue)
                {
                    // it's an existing room
                    room = this.Db.ChatRooms.Find(viewModel.Id);
                    if (room == null)
                        throw new Exception("Cannot edit room. Room not found. Room id: " + viewModel);

                    room.Name = viewModel.RoomName;
                    room.Description = viewModel.Description;
                }
                else
                {
                    room = this.Db.ChatRooms.Add(new ChatRoom
                    {
                        Name = viewModel.RoomName,
                        Description = viewModel.Description
                    });
                }

                this.Db.SaveChanges();
                return this.RedirectToAction("Index", "Dashboard");
            }

            return this.View(viewModel);
        }
    }
}
using System.Collections.Generic;

namespace ChatJs.Admin.Models
{
    public class IndexViewModel
    {
        public IndexViewModel()
        {
            this.Rooms = new List<RoomViewModel>();
            this.Users = new List<UserViewModel>();
        }

        public List<RoomViewModel> Rooms { get; set; }
        public List<UserViewModel> Users { get; set; }
    }
}
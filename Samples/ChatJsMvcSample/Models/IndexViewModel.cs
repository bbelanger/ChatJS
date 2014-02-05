using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatJsMvcSample.Models
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
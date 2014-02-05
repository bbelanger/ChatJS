using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ChatJs.Net;

namespace ChatJsMvcSample.Models
{
    public class RoomViewModel
    {
        public RoomViewModel()
        {
            this.RoomUsers = new List<RoomUserViewModel>();
        }

        public int? Id { get; set; }

        [Required]
        [Display(Name = "Room name")]
        public string RoomName { get; set; }

        [Display(Name = "Description")]
        public string Description { get; set; }

        public List<RoomUserViewModel> RoomUsers { get; set; }

        public int RoomUsersCount { get; set; }
    }
}
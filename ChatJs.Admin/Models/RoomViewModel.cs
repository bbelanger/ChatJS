#region

using System.ComponentModel.DataAnnotations;

#endregion

namespace ChatJs.Admin.Models
{
    public class RoomViewModel
    {
        public int? Id { get; set; }

        [Required]
        [Display(Name = "Room name")]
        public string RoomName { get; set; }

        [Display(Name = "Description")]
        public string Description { get; set; }

        public int RoomUsersCount { get; set; }
    }
}
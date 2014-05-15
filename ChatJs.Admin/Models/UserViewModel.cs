using System.ComponentModel.DataAnnotations;

namespace ChatJs.Admin.Models
{
    public class UserViewModel
    {
        public int? Id { get; set; }

        /// <summary>
        ///     Indicates whether the user is authenticated in the chat
        /// </summary>
        public bool IsAuthenticated { get; set; }

        [Required]
        [Display(Name = "User name")]
        public string UserName { get; set; }

        [Required]
        [Display(Name = "Display name")]
        public string DisplayName { get; set; }

        public string ProfilePictureUrl { get; set; }

        public string ProfilePictureLargeUrl { get; set; }

        [Required]
        [Display(Name = "E-Mail")]
        public string EMail { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace ChatJsMvcSample.Models
{
    public class UserViewModel
    {
        public int? Id { get; set; }

        /// <summary>
        /// Indicates whether the user is authenticated in the chat
        /// </summary>
        public bool IsAuthenticated { get; set; }

        [Required]
        public string DisplayName { get; set; }

        public string ProfilePictureUrl { get; set; }

        public string ProfilePictureLargeUrl { get; set; }

        [Required]
        public string EMail { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }
    }
}
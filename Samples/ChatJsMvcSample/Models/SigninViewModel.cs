using System.ComponentModel.DataAnnotations;

namespace ChatJsMvcSample.Models
{
    public class SigninViewModel
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string RoomName { get; set; }

        public bool RememberMe { get; set; }
    }
}
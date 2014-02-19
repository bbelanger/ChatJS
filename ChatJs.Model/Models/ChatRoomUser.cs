using System;
using System.Collections.Generic;

namespace ChatJs.Model.Models
{
    public partial class ChatRoomUser
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public virtual ChatRoom ChatRoom { get; set; }
        public virtual User User { get; set; }
    }
}

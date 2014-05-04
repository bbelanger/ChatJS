namespace ChatJs.Lib
{
    public class ChatTypingSignalInfo
    {
        // room to send the typing signal to
        public int? RoomId { get; set; }

        // conversation to send the typing signal to
        public int? ConversationId { get; set; }

        // user to send the typing signal to
        public int? UserToId { get; set; }

        // user that originated the typing signal
        public ChatUserInfo UserFrom { get; set; }
    }
}
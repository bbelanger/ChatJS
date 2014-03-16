#region

using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

#endregion

namespace ChatJs.Lib
{
    public interface IChatHub
    {
        /// <summary>
        ///     Returns the message history between the current user and another user
        /// </summary>
        List<ChatMessageInfo> GetMessageHistory(int otherUserId);

        /// <summary>
        ///     Sends a message to a another user
        /// </summary>
        void SendMessage(int? roomId, int? conversationId, int? userToId, string message, string clientGuid);

        /// <summary>
        ///     Sends a typing signal to a another user
        /// </summary>
        void SendTypingSignal(int? roomId, int? conversationId, int? userToId);

        /// <summary>
        /// Sends a message indicating the given user is entering the given room
        /// </summary>
        /// <param name="roomId"></param>
        /// <param name="userId"></param>
        void EnterRoom(int roomId);

        /// <summary>
        /// Sends a message indicating the given user is leaving the given room
        /// </summary>
        /// <param name="roomId"></param>
        /// <param name="userId"></param>
        void LeaveRoom(int roomId);

        /// <summary>
        ///     Gets the list of available users in the current room
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="roomId"></param>
        /// <param name="conversationId"></param>
        /// <returns></returns>
        List<ChatUserInfo> GetUserList(int? roomId, int? conversationId);

        /// <summary>
        ///     Gets the list of available rooms
        /// </summary>
        /// <returns></returns>
        List<ChatRoomInfo> GetRoomsList();

        /// <summary>
        ///     When a new client connects
        /// </summary>
        Task OnConnected();

        /// <summary>
        ///     When a client disconnects
        /// </summary>
        Task OnDisconnected();
    }
}
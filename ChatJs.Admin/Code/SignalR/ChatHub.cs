using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ChatJs.Lib;
using ChatJs.Model;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.SignalR;

namespace ChatJs.Admin.Code.SignalR
{
    public class ChatHub : Hub, IChatHub
    {
        public ChatHub()
        {
            this.Db = new ChatjsContext();
            this.UserManager = new ChatJsUserManager(new ChatJsUserStore(this.Db));
        }

        private ChatJsUserManager UserManager { get; set; }

        private ChatjsContext Db { get; set; }

        #region IChatHub implementation

        /// <summary>
        /// Returns the message history
        /// </summary>
        public List<ChatMessageInfo> GetMessageHistory(int? roomId, int? conversationId, int? otherUserId)
        {
            var myUserId = this.GetMyUserId();

            IQueryable<ChatMessage> messages = null;
            if (roomId.HasValue)
                messages = this.Db.ChatMessages.Where(m => m.RoomId == roomId.Value);
            else if (conversationId.HasValue)
                messages = this.Db.ChatMessages.Where(m => m.ConversationId == conversationId.Value);
            else if (otherUserId.HasValue)
                messages =
                    this.Db.ChatMessages.Where(
                        m =>
                            (m.UserTo.Id == myUserId && m.UserFromId == otherUserId) ||
                            (m.UserTo.Id == otherUserId && m.UserFromId == myUserId));

            if (messages == null)
                throw new Exception("Could not get messages");

            var messagesList = messages.OrderByDescending(m => m.DateTime).Take(30).ToList();

            messagesList.Reverse();
            return messagesList.Select(m => this.GetChatMessageInfo(m, null)).ToList();
        }

        public void LeaveRoom(int roomId)
        {
            var myUserId = this.GetMyUserId();
            ChatHubCache.RemoveUserFromRoom(myUserId, roomId);
            this.BroadcastUserList(roomId, new[] { myUserId });
            this.BroadcastRoomList();
        }

        /// <summary>
        ///     Returns the user list in the given room or conversation
        /// </summary>
        /// <param name="roomId"></param>
        /// <param name="conversationId"></param>
        public List<ChatUserInfo> GetUserList(int? roomId, int? conversationId)
        {
            if (roomId.HasValue)
            {
                var usersInRoom = ChatHubCache.GetRoomUsers(roomId.Value);
                var dbUsers = this.Db.Users.Where(u => usersInRoom.Contains(u.Id)).ToList();
                return dbUsers.Select(u => this.GetUserInfo(u, ChatUserInfo.StatusType.Online)).ToList();
            }

            throw new NotImplementedException("Conversations are not supported yet");
        }


        /// <summary>
        ///     Sends a message to a particular user
        /// </summary>
        public void SendMessage(int? roomId, int? conversationId, int? userToId, string message, string clientGuid)
        {
            var myUserId = this.GetMyUserId();

            var dbChatMessage = new ChatMessage
            {
                DateTime = DateTime.UtcNow,
                Message = message,
                UserFromId = myUserId,
                RoomId = roomId,
                ConversationId = conversationId,
                UserToId = userToId
            };

            this.Db.ChatMessages.Add(dbChatMessage);
            this.Db.SaveChanges();

            // gets the connections that have to receive the message
            var connectionIds = ChatHubCache.GetConnectionsToTarget(myUserId, roomId, conversationId, userToId);

            var chatMessage = this.GetChatMessageInfo(dbChatMessage, clientGuid);
            foreach (var connectionId in connectionIds)
                this.Clients.Client(connectionId).sendMessage(chatMessage);
        }

        /// <summary>
        ///     Sends a typing signal to a particular user
        /// </summary>
        public void SendTypingSignal(int? roomId, int? conversationId, int? userToId)
        {
            var myUserId = this.GetMyUserId();

            var connectionIds = ChatHubCache.GetConnectionsToTarget(myUserId, roomId, conversationId, userToId);
            foreach (var connectionId in connectionIds)
                this.Clients.Client(connectionId).sendTypingSignal(new ChatTypingSignalInfo
                {
                    RoomId = roomId,
                    ConversationId = conversationId,
                    UserToId = userToId,
                    UserFrom = this.GetUserInfo(myUserId)
                });
        }

        public void EnterRoom(int roomId)
        {
            var myUserId = this.GetMyUserId();
            ChatHubCache.AddUserToRoom(myUserId, roomId);
            this.BroadcastUserList(roomId, new[] {myUserId});
            this.BroadcastRoomList();
        }

        /// <summary>
        ///     Gets the list of available rooms
        /// </summary>
        /// <returns></returns>
        public List<ChatRoomInfo> GetRoomsList()
        {
            var rooms = this.Db.ChatRooms.ToList().Select(this.GetChatRoomInfo).ToList();
            return rooms;
        }

        /// <summary>
        ///     Triggered when the user opens a new browser window
        /// </summary>
        /// <returns></returns>
        public override Task OnConnected()
        {
            var myUserId = this.GetMyUserId();
            ChatHubCache.AddUserConnection(myUserId, this.Context.ConnectionId);

            return base.OnConnected();
        }

        /// <summary>
        ///     Triggered when the user closes the browser window
        /// </summary>
        /// <returns></returns>
        public override Task OnDisconnected()
        {
            //ChatHubCache.RemoveUserConnection(this.Context.ConnectionId);
            var disconnectedUserId = ChatHubCache.GetUserIdFromConnection(this.Context.ConnectionId);
            ChatHubCache.RemoveUserConnection(this.Context.ConnectionId);
            var roomsId = new int[0];
            if (disconnectedUserId.HasValue)
            {
                if (!ChatHubCache.GetUsersConnections(new[] {disconnectedUserId.Value}).Any())
                {
                    // in this case, the user DID NOT connect back after the disconnect.
                    // This user now should be removed from all rooms and conversations he/she is in
                    roomsId = ChatHubCache.RoomsFromUser(disconnectedUserId.Value);
                    // drops the user from the cache
                    ChatHubCache.DropUser(disconnectedUserId.Value);
                }

                if (roomsId.Any())
                    Task.Run(() =>
                    {
                        Thread.Sleep(2000);
                        if (!ChatHubCache.GetUsersConnections(new[] {disconnectedUserId.Value}).Any())
                        {
                            foreach (var roomId in roomsId)
                                this.BroadcastUserList(roomId);
                            this.BroadcastRoomList();
                        }
                    });
            }

            return base.OnDisconnected();
        }

        /// <summary>
        ///     If the specified user is connected, return information about the user
        /// </summary>
        public ChatUserInfo GetUserInfo(int id)
        {
            var user = this.UserManager.FindById(id);
            return user == null ? null : this.GetUserInfo(user, ChatUserInfo.StatusType.Online);
        }

        #endregion

        private ChatUserInfo GetUserInfo(User user, ChatUserInfo.StatusType status)
        {
            if (user == null) throw new ArgumentNullException("user");
            return new ChatUserInfo
            {
                Id = user.Id,
                Name = user.DisplayName,
                Status = status,
                ProfilePictureUrl =
                    GravatarHelper.GetGravatarUrl(GravatarHelper.GetGravatarHash(user.Email),
                        GravatarHelper.Size.S32)
            };
        }

        private ChatMessageInfo GetChatMessageInfo(ChatMessage chatMessage, string clientGuid)
        {
            if (chatMessage == null) throw new ArgumentNullException("chatMessage");
            return new ChatMessageInfo
            {
                Message = chatMessage.Message,
                UserFromId = chatMessage.UserFromId,
                UserToId = chatMessage.UserToId,
                ConversationId = chatMessage.ConversationId,
                RoomId = chatMessage.RoomId,
                ClientGuid = clientGuid
            };
        }

        private ChatRoomInfo GetChatRoomInfo(ChatRoom chatRoom)
        {
            if (chatRoom == null) throw new ArgumentNullException("chatRoom");
            return new ChatRoomInfo
            {
                Id = chatRoom.Id,
                Name = chatRoom.Name,
                UsersOnline = ChatHubCache.GetRoomUsers(chatRoom.Id).Count()
            };
        }

        /// <summary>
        ///     Returns my user id, or null if there's no logged user
        /// </summary>
        /// <returns></returns>
        private int GetMyUserId()
        {
            if (this.Context.User == null)
                throw new Exception("User is not logged in");
            return int.Parse(this.Context.User.Identity.GetUserId());
        }


        /// <summary>
        ///     Broadcasts to all users in the same room the new users list
        /// </summary>
        private void BroadcastUserList(int roomId, int[] exceptUsers = null)
        {
            var connectionsToNotify = ChatHubCache.GetRoomConnections(roomId, exceptUsers);
            var usersInRoom = this.GetUserList(roomId, null);
            foreach (var connectionId in connectionsToNotify)
                this.Clients.Client(connectionId).userListChanged(new ChatUserListChangedInfo
                {
                    RoomId = roomId,
                    ConversationId = null,
                    UserList = usersInRoom
                });
        }

        /// <summary>
        /// 
        /// </summary>
        private void BroadcastRoomList()
        {
            var connectionsToNotify = ChatHubCache.GetAllConnections();
            foreach (var connectionId in connectionsToNotify)
            {
                this.Clients.Client(connectionId).roomListChanged(new ChatRoomListChangedInfo
                {
                    Rooms = this.GetRoomsList()
                });
            }
        }
    }
}
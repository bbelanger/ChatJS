#region

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

#endregion

namespace ChatJs.Admin.Code.SignalR
{
    public class ChatHub : Hub, IChatHub
    {
        /// <summary>
        ///     This STUB. In a normal situation, there would be multiple rooms and the user room would have to be
        ///     determined by the user profile
        /// </summary>
        public const string ROOM_ID_STUB = "chatjs-room";

        /// <summary>
        ///     Current connections
        ///     1 room has many users that have many connections (2 open browsers from the same user represents 2 connections)
        /// </summary>
        private static readonly Dictionary<string, Dictionary<int, List<string>>> connections =
            new Dictionary<string, Dictionary<int, List<string>>>();

        public ChatHub()
        {
            this.Db = new ChatjsContext();
            this.UserManager = new ChatJsUserManager(new ChatJsUserStore(this.Db));
        }

        public ChatJsUserManager UserManager { get; set; }

        public ChatjsContext Db { get; set; }

        /// <summary>
        ///     If the specified user is connected, return information about the user
        /// </summary>
        public ChatUserInfo GetUserInfo(int id)
        {
            var user = this.UserManager.FindById(id);
            return user == null ? null : this.GetUserInfo(user);
        }

        private ChatUserInfo GetUserInfo(User user)
        {
            if (user == null) throw new ArgumentNullException("user");
            var myRoomId = this.GetMyRoomId();

            ChatUserInfo.StatusType userStatus;
            lock (connections)
            {
                userStatus = connections.ContainsKey(myRoomId)
                    ? (connections[myRoomId].ContainsKey(user.Id)
                        ? ChatUserInfo.StatusType.Online
                        : ChatUserInfo.StatusType.Offline)
                    : ChatUserInfo.StatusType.Offline;
            }
            return new ChatUserInfo
            {
                Id = user.Id,
                Name = user.DisplayName,
                Status = userStatus,
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
                UserToId = chatMessage.User.Id,
                ClientGuid = clientGuid
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

        private string GetMyRoomId()
        {
            // This would normally be done like this:
            //var userPrincipal = this.Context.User as AuthenticatedPrincipal;
            //if (userPrincipal == null)
            //    throw new NotAuthorizedException();

            //var userData = userPrincipal.Profile;
            //return userData.MyTenancyIdentifier;

            // But for this example, it will always return "chatjs-room", because we have only one room.
            return ROOM_ID_STUB;
        }

        /// <summary>
        ///     Broadcasts to all users in the same room the new users list
        /// </summary>
        private void NotifyUsersChanged()
        {
            var myRoomId = this.GetMyRoomId();
            var myUserId = this.GetMyUserId();

            if (connections.ContainsKey(myRoomId))
            {
                foreach (var userId in connections[myRoomId].Keys)
                {
                    // we don't want to broadcast to the current user
                    if (userId == myUserId)
                        continue;

                    var userIdClusure = userId;

                    // creates a list of users that contains all users with the exception of the user to which 
                    // the list will be sent
                    // every user will receive a list of user that exclude him/hearself
                    var usersList = this.Db.Users.Where(u => u.Id != userIdClusure);

                    if (connections[myRoomId][userId] != null)
                        foreach (var connectionId in connections[myRoomId][userId])
                            this.Clients.Client(connectionId).usersListChanged(usersList);
                }
            }
        }

        /// <summary>
        ///     Returns the message history
        /// </summary>
        public List<ChatUserInfo> GetUsersList()
        {
            var myUserId = this.GetMyUserId();

            var roomUsers = this.Db.Users.Where(u => u.Id != myUserId).OrderBy(u => u.DisplayName).ToList();

            // now we have to see the users who are online and those who are not
            return roomUsers.Select(this.GetUserInfo).ToList();
        }

        /// <summary>
        ///     Returns the message history
        /// </summary>
        public List<ChatMessageInfo> GetMessageHistory(int otherUserId)
        {
            var myUserId = this.GetMyUserId();
            // this is STUB. Normally you would go to the real database to get the messages
            var messages = Db.ChatMessages
                .Where(
                    m =>
                        (m.User.Id == myUserId && m.UserFromId == otherUserId) ||
                        (m.User.Id == otherUserId && m.UserFromId == myUserId))
                .OrderByDescending(m => m.DateTime).Take(30).ToList();

            messages.Reverse();
            return messages.Select(m => this.GetChatMessageInfo(m, null)).ToList(); ;
        }

        #region IChatHub

        /// <summary>
        ///     Sends a message to a particular user
        /// </summary>
        public void SendMessage(int otherUserId, string message, string clientGuid)
        {
            var myUserId = this.GetMyUserId();
            var myRoomId = this.GetMyRoomId();

            var dbChatMessage = new ChatMessage()
            {
                DateTime = DateTime.UtcNow,
                Message = message,
                UserFromId = myUserId,
                UserId = otherUserId
            };

            this.Db.ChatMessages.Add(dbChatMessage);
            this.Db.SaveChanges();

            var connectionIds = new List<string>();
            lock (connections)
            {
                if (connections[myRoomId].ContainsKey(otherUserId))
                    connectionIds.AddRange(connections[myRoomId][otherUserId]);
                if (connections[myRoomId].ContainsKey(myUserId))
                    connectionIds.AddRange(connections[myRoomId][myUserId]);
            }
            foreach (var connectionId in connectionIds)
                this.Clients.Client(connectionId).sendMessage(dbChatMessage);
        }

        /// <summary>
        ///     Sends a typing signal to a particular user
        /// </summary>
        public void SendTypingSignal(int otherUserId)
        {
            var myUserId = this.GetMyUserId();
            var myRoomId = this.GetMyRoomId();

            var connectionIds = new List<string>();
            lock (connections)
            {
                if (connections[myRoomId].ContainsKey(otherUserId))
                    connectionIds.AddRange(connections[myRoomId][otherUserId]);
            }
            foreach (var connectionId in connectionIds)
                this.Clients.Client(connectionId).sendTypingSignal(myUserId);
        }

        /// <summary>
        ///     Triggered when the user opens a new browser window
        /// </summary>
        /// <returns></returns>
        public override Task OnConnected()
        {
            var myRoomId = this.GetMyRoomId();

            var myUserId = this.GetMyUserId();

            lock (connections)
            {
                if (!connections.ContainsKey(myRoomId))
                    connections[myRoomId] = new Dictionary<int, List<string>>();

                if (!connections[myRoomId].ContainsKey(myUserId))
                {
                    // in this case, this is a NEW connection for the current user,
                    // not another browser window opening
                    connections[myRoomId][myUserId] = new List<string>();
                    this.NotifyUsersChanged();
                }
                connections[myRoomId][myUserId].Add(this.Context.ConnectionId);
            }

            return base.OnConnected();
        }

        /// <summary>
        ///     Triggered when the user closes the browser window
        /// </summary>
        /// <returns></returns>
        public override Task OnDisconnected()
        {
            var myRoomId = this.GetMyRoomId();
            var myUserId = this.GetMyUserId();

            lock (connections)
            {
                if (connections.ContainsKey(myRoomId))
                    if (connections[myRoomId].ContainsKey(myUserId))
                        if (connections[myRoomId][myUserId].Contains(this.Context.ConnectionId))
                        {
                            connections[myRoomId][myUserId].Remove(this.Context.ConnectionId);
                            if (!connections[myRoomId][myUserId].Any())
                            {
                                connections[myRoomId].Remove(myUserId);
                                Task.Run(() =>
                                {
                                    // this will run in separate thread.
                                    // If the user is away for more than 10 seconds it will be removed from 
                                    // the room.
                                    // In a normal situation this wouldn't be done because normally the users in a
                                    // chat room are fixed, like when you have 1 chat room for each tenancy
                                    Thread.Sleep(10000);
                                    if (!connections[myRoomId].ContainsKey(myUserId))
                                    {
                                        var myDbUser = this.Db.Users.FirstOrDefault(u => u.Id == myUserId);
                                        if (myDbUser != null)
                                        {
                                            this.Db.Users.Remove(myDbUser);
                                            this.NotifyUsersChanged();
                                        }
                                    }
                                });
                            }
                        }
            }

            return base.OnDisconnected();
        }



        #endregion
    }
}
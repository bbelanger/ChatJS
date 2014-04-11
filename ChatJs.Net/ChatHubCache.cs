#region

using System;
using System.Collections.Generic;
using System.Linq;

#endregion

namespace ChatJs.Lib
{
    /// <summary>
    ///     Data structure to represent the currently connected users as well as which rooms and conversation they are in now
    /// </summary>
    public class ChatHubCache
    {
        private static readonly object connectionsLockObject = new object();
        private static readonly Dictionary<int, List<string>> userToConnections = new Dictionary<int, List<string>>();
        private static readonly Dictionary<string, int> connectionToUser = new Dictionary<string, int>();
        private static readonly Dictionary<int, List<int>> userToRooms = new Dictionary<int, List<int>>();
        private static readonly Dictionary<int, List<int>> roomToUsers = new Dictionary<int, List<int>>();

        /// <summary>
        ///     Adds a user connection
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="connectionId"></param>
        public static void AddUserConnection(int userId, string connectionId)
        {
            lock (connectionsLockObject)
            {
                if (!userToConnections.ContainsKey(userId))
                    userToConnections[userId] = new List<string>();
                userToConnections[userId].Add(connectionId);
                connectionToUser[connectionId] = userId;
            }
        }

        /// <summary>
        ///     Removes a user connection
        /// </summary>
        /// <param name="connectionId"></param>
        public static void RemoveUserConnection(string connectionId)
        {
            lock (connectionsLockObject)
            {
                if (connectionToUser.ContainsKey(connectionId))
                {
                    var userId = connectionToUser[connectionId];
                    userToConnections[userId].Remove(connectionId);
                    connectionToUser.Remove(connectionId);

                    // todo: determine what to do when all user connections are lost
                }
            }
        }

        /// <summary>
        ///     Returns all connections from the given users
        /// </summary>
        /// <param name="userIds"></param>
        /// <returns></returns>
        public static string[] GetUsersConnections(int[] userIds)
        {
            lock (connectionsLockObject)
            {
                var connections = new List<string>();
                // gets all users that actually contain connections
                foreach (var userId in userIds.Where(userId => userToConnections.ContainsKey(userId)))
                    // get their connections
                    connections.AddRange(userToConnections[userId]);
                return connections.ToArray();
            }
        }

        /// <summary>
        ///     Adds a user to a room
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="roomId"></param>
        public static void AddUserToRoom(int userId, int roomId)
        {
            lock (connectionsLockObject)
            {
                if (!userToRooms.ContainsKey(userId))
                    userToRooms[userId] = new List<int>();
                if (!userToRooms[userId].Contains(roomId))
                    userToRooms[userId].Add(roomId);

                if (!roomToUsers.ContainsKey(roomId))
                    roomToUsers[roomId] = new List<int>();
                if (!roomToUsers[roomId].Contains(userId))
                    roomToUsers[roomId].Add(userId);
            }
        }

        /// <summary>
        ///     Removes a user from a room
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="roomId"></param>
        public static void RemoveUserFromRoom(int userId, int roomId)
        {
            lock (connectionsLockObject)
            {
                if (!userToRooms.ContainsKey(userId))
                    userToRooms[userId] = new List<int>();
                userToRooms[userId].Remove(roomId);

                if (roomToUsers.ContainsKey(roomId))
                {
                    roomToUsers[roomId].Remove(userId);
                    if (!roomToUsers[roomId].Any())
                        roomToUsers.Remove(roomId);
                }
            }
        }

        /// <summary>
        ///     Returns all users inside the given room
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns></returns>
        public static int[] GetRoomUsers(int roomId)
        {
            lock (connectionsLockObject)
            {
                return roomToUsers.ContainsKey(roomId) ? roomToUsers[roomId].ToArray() : new int[] {};
            }
        }

        /// <summary>
        ///     Returns all connections from users inside the given room
        /// </summary>
        /// <returns></returns>
        public static string[] GetRoomConnections(int roomId, int[] exceptUsers = null)
        {
            lock (connectionsLockObject)
            {
                var result = new List<string>();
                if (roomToUsers.ContainsKey(roomId))
                    foreach (
                        var userId in
                            roomToUsers[roomId].Where(
                                userId =>
                                    (exceptUsers == null || !exceptUsers.Contains(userId)) &&
                                    userToConnections.ContainsKey(userId)))
                        result.AddRange(userToConnections[userId]);

                return result.ToArray();
            }
        }

        /// <summary>
        ///     Makes it easier to get all connections to the given target.
        ///     Only one of the arguments can be populated at once.
        /// </summary>
        /// <param name="myUserId"></param>
        /// <param name="roomId"></param>
        /// <param name="conversationId"></param>
        /// <param name="userToId"></param>
        /// <returns></returns>
        public static string[] GetConnectionsToTarget(int myUserId, int? roomId, int? conversationId, int? userToId)
        {
            lock (connectionsLockObject)
            {
                var connectionIds = new List<string>();
                if (userToId.HasValue)
                    connectionIds.AddRange(GetUsersConnections(new[] {myUserId, userToId.Value}));
                else if (conversationId.HasValue)
                    throw new NotImplementedException("Conversations support is not finished yet");
                else if (roomId.HasValue)
                    connectionIds.AddRange(GetRoomConnections(roomId.Value));
                return connectionIds.Distinct().ToArray();
            }
        }

        public static int? GetUserIdFromConnection(string connectionId)
        {
            lock (connectionsLockObject)
            {
                if (connectionToUser.ContainsKey(connectionId))
                    return connectionToUser[connectionId];
                return null;
            }
        }

        public static int[] RoomsFromUser(int userId)
        {
            lock (connectionsLockObject)
            {
                return userToRooms.ContainsKey(userId) ? userToRooms[userId].ToArray() : new int[0];
            }
        }

        /// <summary>
        ///     Eliminates the given user from the cache
        /// </summary>
        /// <param name="userId"></param>
        public static void DropUser(int userId)
        {
            lock (connectionsLockObject)
            {
                if (userToConnections.ContainsKey(userId))
                {
                    var userConnections = userToConnections[userId].ToArray();
                    var userRooms = new int[0];

                    // remove user from connections index
                    userToConnections.Remove(userId);
                    foreach (
                        var connection in
                            userConnections.Where(connection => connectionToUser.ContainsKey(connection)))
                        connectionToUser.Remove(connection);

                    // remove user from rooms index
                    if (userToRooms.ContainsKey(userId))
                    {
                        userRooms = userToRooms[userId].ToArray();
                        userToRooms.Remove(userId);
                    }
                    foreach (var roomId in userRooms.Where(roomId => roomToUsers[roomId].Contains(userId)))
                        roomToUsers[roomId].Remove(userId);
                }
            }
        }
    }
}
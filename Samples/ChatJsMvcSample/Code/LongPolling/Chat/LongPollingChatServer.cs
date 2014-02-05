using System;
using System.Collections.Generic;

namespace ChatJsMvcSample.Code.LongPolling.Chat
{
    public static class LongPollingChatServer
    {
        /// <summary>
        /// Lock target for creating rooms (to prevent concurrent threads to create the same room more than once)
        /// </summary>
        private static readonly object roomLock = new Object();

        static LongPollingChatServer()
        {
            Rooms = new Dictionary<string, ChatRoom>();
        }

        public static Dictionary<string, ChatRoom> Rooms { get; private set; }

        /// <summary>
        /// Returns whether or not the given room
        /// </summary>
        /// <param name="roomId"> </param>
        public static bool RoomExists(string roomId)
        {
            return Rooms.ContainsKey(roomId);
        }

        /// <summary>
        /// Sets up a room if it does not exist
        /// </summary>
        /// <param name="db"></param>
        /// <param name="roomId"></param>
        public static ChatRoom SetupRoomIfNonexisting(string roomId)
        {
            lock (roomLock)
            {
                // if the given room hasn't been set up yet, it must be done now
                if (LongPollingChatServer.RoomExists(roomId))
                    return LongPollingChatServer.Rooms[roomId];
                // creates the chat room
                var newChatRoom = new ChatRoom(roomId);
                LongPollingChatServer.Rooms.Add(roomId, newChatRoom);
                return newChatRoom;
            }
        }
    }
}
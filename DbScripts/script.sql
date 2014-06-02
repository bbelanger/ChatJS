/****** Object:  Table [dbo].[__MigrationHistory]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__MigrationHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ContextKey] [nvarchar](300) NOT NULL,
	[Model] [varbinary](max) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK_dbo.__MigrationHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC,
	[ContextKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[ChatConversation]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatConversation](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[StartDateTime] [datetime] NOT NULL,
	[RoomId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.ChatConversation] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[ChatMessage]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatMessage](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoomId] [int] NULL,
	[ConversationId] [int] NULL,
	[UserFromId] [int] NOT NULL,
	[Body] [nvarchar](max) NOT NULL,
	[DateTime] [datetime] NOT NULL,
	[UserToId] [int] NULL,
 CONSTRAINT [PK_dbo.ChatMessage] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[ChatRoom]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatRoom](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](200) NULL,
 CONSTRAINT [PK_dbo.ChatRoom] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[ChatRoomUsers]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatRoomUsers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoomId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.ChatRoomUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[ChatUserConversations]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatUserConversations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[ConversationId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.ChatUserConversations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[User]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[DisplayName] [nvarchar](50) NULL,
	[Email] [nvarchar](max) NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[PasswordHash] [nvarchar](200) NOT NULL,
	[SecurityStamp] [nvarchar](max) NULL,
	[PhoneNumber] [nvarchar](max) NULL,
	[PhoneNumberConfirmed] [bit] NOT NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[UserName] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_dbo.User] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[UserClaims]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
 CONSTRAINT [PK_dbo.UserClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[UserLogins]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserLogins](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LoginProvider] [nvarchar](max) NULL,
	[ProviderKey] [nvarchar](max) NULL,
	[UserId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.UserLogins] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
/****** Object:  Table [dbo].[UserRoles]    Script Date: 02/06/2014 00:00:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRoles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.UserRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF)
)

GO
SET IDENTITY_INSERT [dbo].[ChatRoom] ON 

INSERT [dbo].[ChatRoom] ([Id], [Name], [Description]) VALUES (1, N'Default room', N'')
SET IDENTITY_INSERT [dbo].[ChatRoom] OFF
SET IDENTITY_INSERT [dbo].[User] ON 

INSERT [dbo].[User] ([Id], [DisplayName], [Email], [EmailConfirmed], [PasswordHash], [SecurityStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [UserName]) VALUES (3, N'Admin', N'admin@admin.com', 0, N'ABhzFztPnHGn5iC6NLiLlVr5kzSIhQ3HaeYGY6xL+ZOvt49M3u20yaUf9qbAtSkFbg==', N'fedc6ae1-9085-4851-995c-9a97647585a4', NULL, 0, 0, N'admin')
SET IDENTITY_INSERT [dbo].[User] OFF
/****** Object:  Index [IX_RoomId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_RoomId] ON [dbo].[ChatConversation]
(
	[RoomId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_RoomId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_RoomId] ON [dbo].[ChatMessage]
(
	[RoomId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserFromId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserFromId] ON [dbo].[ChatMessage]
(
	[UserFromId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserToId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserToId] ON [dbo].[ChatMessage]
(
	[UserToId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_RoomId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_RoomId] ON [dbo].[ChatRoomUsers]
(
	[RoomId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[ChatRoomUsers]
(
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_ConversationId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_ConversationId] ON [dbo].[ChatUserConversations]
(
	[ConversationId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[ChatUserConversations]
(
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[UserClaims]
(
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[UserLogins]
(
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
/****** Object:  Index [IX_UserId]    Script Date: 02/06/2014 00:00:49 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[UserRoles]
(
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF)
GO
ALTER TABLE [dbo].[ChatConversation]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatConversation_dbo.ChatRoom_RoomId] FOREIGN KEY([RoomId])
REFERENCES [dbo].[ChatRoom] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatConversation] CHECK CONSTRAINT [FK_dbo.ChatConversation_dbo.ChatRoom_RoomId]
GO
ALTER TABLE [dbo].[ChatMessage]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatMessage_dbo.ChatRoom_RoomId] FOREIGN KEY([RoomId])
REFERENCES [dbo].[ChatRoom] ([Id])
GO
ALTER TABLE [dbo].[ChatMessage] CHECK CONSTRAINT [FK_dbo.ChatMessage_dbo.ChatRoom_RoomId]
GO
ALTER TABLE [dbo].[ChatMessage]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatMessage_dbo.User_UserFromId] FOREIGN KEY([UserFromId])
REFERENCES [dbo].[User] ([Id])
GO
ALTER TABLE [dbo].[ChatMessage] CHECK CONSTRAINT [FK_dbo.ChatMessage_dbo.User_UserFromId]
GO
ALTER TABLE [dbo].[ChatMessage]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatMessage_dbo.User_UserToId] FOREIGN KEY([UserToId])
REFERENCES [dbo].[User] ([Id])
GO
ALTER TABLE [dbo].[ChatMessage] CHECK CONSTRAINT [FK_dbo.ChatMessage_dbo.User_UserToId]
GO
ALTER TABLE [dbo].[ChatRoomUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatRoomUsers_dbo.ChatRoom_RoomId] FOREIGN KEY([RoomId])
REFERENCES [dbo].[ChatRoom] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatRoomUsers] CHECK CONSTRAINT [FK_dbo.ChatRoomUsers_dbo.ChatRoom_RoomId]
GO
ALTER TABLE [dbo].[ChatRoomUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatRoomUsers_dbo.User_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatRoomUsers] CHECK CONSTRAINT [FK_dbo.ChatRoomUsers_dbo.User_UserId]
GO
ALTER TABLE [dbo].[ChatUserConversations]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatUserConversations_dbo.ChatConversation_ConversationId] FOREIGN KEY([ConversationId])
REFERENCES [dbo].[ChatConversation] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatUserConversations] CHECK CONSTRAINT [FK_dbo.ChatUserConversations_dbo.ChatConversation_ConversationId]
GO
ALTER TABLE [dbo].[ChatUserConversations]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ChatUserConversations_dbo.User_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatUserConversations] CHECK CONSTRAINT [FK_dbo.ChatUserConversations_dbo.User_UserId]
GO
ALTER TABLE [dbo].[UserClaims]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserClaims_dbo.User_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserClaims] CHECK CONSTRAINT [FK_dbo.UserClaims_dbo.User_UserId]
GO
ALTER TABLE [dbo].[UserLogins]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserLogins_dbo.User_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserLogins] CHECK CONSTRAINT [FK_dbo.UserLogins_dbo.User_UserId]
GO
ALTER TABLE [dbo].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserRoles_dbo.User_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserRoles] CHECK CONSTRAINT [FK_dbo.UserRoles_dbo.User_UserId]
GO

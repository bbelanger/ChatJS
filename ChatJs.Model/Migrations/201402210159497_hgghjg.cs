namespace ChatJs.Model.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class hgghjg : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ChatConversation",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        StartDateTime = c.DateTime(nullable: false),
                        RoomId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ChatRoom", t => t.RoomId, cascadeDelete: true)
                .Index(t => t.RoomId);
            
            CreateTable(
                "dbo.ChatRoom",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 50),
                        Description = c.String(maxLength: 200),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.ChatMessage",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoomId = c.Int(nullable: false),
                        ConversationId = c.Int(nullable: false),
                        UserFromId = c.Int(nullable: false),
                        Body = c.String(nullable: false),
                        DateTime = c.DateTime(nullable: false),
                        UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ChatRoom", t => t.RoomId, cascadeDelete: true)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .ForeignKey("dbo.User", t => t.UserFromId)
                .Index(t => t.RoomId)
                .Index(t => t.UserFromId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.User",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DisplayName = c.String(maxLength: 50),
                        Email = c.String(),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(nullable: false, maxLength: 200),
                        SecurityStamp = c.String(),
                        PhoneNumber = c.String(),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        UserName = c.String(nullable: false, maxLength: 100),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.ChatRoomUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoomId = c.Int(nullable: false),
                        UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ChatRoom", t => t.RoomId, cascadeDelete: true)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .Index(t => t.RoomId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.ChatUserConversations",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        ConversationId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ChatConversation", t => t.ConversationId, cascadeDelete: true)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.ConversationId);
            
            CreateTable(
                "dbo.UserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.UserLogins",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        LoginProvider = c.String(),
                        ProviderKey = c.String(),
                        UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.UserRoles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        RoleId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.ChatConversation", "RoomId", "dbo.ChatRoom");
            DropForeignKey("dbo.ChatMessage", "UserFromId", "dbo.User");
            DropForeignKey("dbo.ChatMessage", "UserId", "dbo.User");
            DropForeignKey("dbo.UserRoles", "UserId", "dbo.User");
            DropForeignKey("dbo.UserLogins", "UserId", "dbo.User");
            DropForeignKey("dbo.UserClaims", "UserId", "dbo.User");
            DropForeignKey("dbo.ChatUserConversations", "UserId", "dbo.User");
            DropForeignKey("dbo.ChatUserConversations", "ConversationId", "dbo.ChatConversation");
            DropForeignKey("dbo.ChatRoomUsers", "UserId", "dbo.User");
            DropForeignKey("dbo.ChatRoomUsers", "RoomId", "dbo.ChatRoom");
            DropForeignKey("dbo.ChatMessage", "RoomId", "dbo.ChatRoom");
            DropIndex("dbo.UserRoles", new[] { "UserId" });
            DropIndex("dbo.UserLogins", new[] { "UserId" });
            DropIndex("dbo.UserClaims", new[] { "UserId" });
            DropIndex("dbo.ChatUserConversations", new[] { "ConversationId" });
            DropIndex("dbo.ChatUserConversations", new[] { "UserId" });
            DropIndex("dbo.ChatRoomUsers", new[] { "UserId" });
            DropIndex("dbo.ChatRoomUsers", new[] { "RoomId" });
            DropIndex("dbo.ChatMessage", new[] { "UserId" });
            DropIndex("dbo.ChatMessage", new[] { "UserFromId" });
            DropIndex("dbo.ChatMessage", new[] { "RoomId" });
            DropIndex("dbo.ChatConversation", new[] { "RoomId" });
            DropTable("dbo.UserRoles");
            DropTable("dbo.UserLogins");
            DropTable("dbo.UserClaims");
            DropTable("dbo.ChatUserConversations");
            DropTable("dbo.ChatRoomUsers");
            DropTable("dbo.User");
            DropTable("dbo.ChatMessage");
            DropTable("dbo.ChatRoom");
            DropTable("dbo.ChatConversation");
        }
    }
}

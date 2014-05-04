namespace ChatJs.Model.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Fix : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.ChatMessage", "RoomId", "dbo.ChatRoom");
            DropForeignKey("dbo.ChatMessage", "UserToId", "dbo.User");
            DropIndex("dbo.ChatMessage", new[] { "RoomId" });
            DropIndex("dbo.ChatMessage", new[] { "UserToId" });
            AlterColumn("dbo.ChatMessage", "RoomId", c => c.Int());
            AlterColumn("dbo.ChatMessage", "UserToId", c => c.Int());
            CreateIndex("dbo.ChatMessage", "RoomId");
            CreateIndex("dbo.ChatMessage", "UserToId");
            AddForeignKey("dbo.ChatMessage", "RoomId", "dbo.ChatRoom", "Id");
            AddForeignKey("dbo.ChatMessage", "UserToId", "dbo.User", "Id");
            DropColumn("dbo.User", "LockoutEndDateUtc");
            DropColumn("dbo.User", "LockoutEnabled");
            DropColumn("dbo.User", "AccessFailedCount");
        }
        
        public override void Down()
        {
            AddColumn("dbo.User", "AccessFailedCount", c => c.Int(nullable: false));
            AddColumn("dbo.User", "LockoutEnabled", c => c.Boolean(nullable: false));
            AddColumn("dbo.User", "LockoutEndDateUtc", c => c.DateTime());
            DropForeignKey("dbo.ChatMessage", "UserToId", "dbo.User");
            DropForeignKey("dbo.ChatMessage", "RoomId", "dbo.ChatRoom");
            DropIndex("dbo.ChatMessage", new[] { "UserToId" });
            DropIndex("dbo.ChatMessage", new[] { "RoomId" });
            AlterColumn("dbo.ChatMessage", "UserToId", c => c.Int(nullable: false));
            AlterColumn("dbo.ChatMessage", "RoomId", c => c.Int(nullable: false));
            CreateIndex("dbo.ChatMessage", "UserToId");
            CreateIndex("dbo.ChatMessage", "RoomId");
            AddForeignKey("dbo.ChatMessage", "UserToId", "dbo.User", "Id", cascadeDelete: true);
            AddForeignKey("dbo.ChatMessage", "RoomId", "dbo.ChatRoom", "Id", cascadeDelete: true);
        }
    }
}

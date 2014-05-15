using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatJs.Model.Models;
using Microsoft.AspNet.Identity;

namespace ChatJs.Admin.Controllers
{
    public class AdminController : ChatJsController
    {
        public string Setup()
        {
            var result = this.UserManager.Create(new User()
            {
                DisplayName = "Admin",
                UserName = "admin",
                Email = "admin@admin.com",
                PasswordHash = this.UserManager.PasswordHasher.HashPassword("admin")
            });
            if (result.Succeeded)
                return "Admin user created successfully. User: admin. Password: admin";
            else
                return "Could not create admin user. Errors: " + string.Join("; ", result.Errors);
        }
    }
}
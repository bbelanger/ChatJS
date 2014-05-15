﻿#region

using System;
using System.Threading.Tasks;
using System.Web.Mvc;
using ChatJs.Admin.Models;
using ChatJs.Model.Models;

#endregion

namespace ChatJs.Admin.Controllers
{
    [Authorize]
    public class UsersController : ChatJsController
    {
        [HttpGet]
        public async Task<ActionResult> EditUser(int? id)
        {
            UserViewModel viewModel;
            if (id.HasValue)
            {
                var existingUser = await this.UserManager.FindByIdAsync(id.Value);
                if (existingUser == null)
                    throw new Exception("Cannot edit user. User not found. User id: " + id);

                viewModel = new UserViewModel
                {
                    Id = existingUser.Id,
                    UserName = existingUser.UserName,
                    DisplayName = existingUser.DisplayName,
                    EMail = existingUser.Email,
                    // it's impossible to retrieve the actual password as it's hashed and salted
                };
            }
            else
                viewModel = null;

            return this.View(viewModel);
        }

        [HttpPost]
        public async Task<ActionResult> EditUser(UserViewModel model)
        {
            if (model.Id.HasValue)
            {
                this.ModelState.Remove("Password");
                this.ModelState.Remove("ConfirmPassword");
            }

            if (this.ModelState.IsValid)
            {
                if (model.Id.HasValue)
                {
                    // it's an existing user
                    var identity = await this.UserManager.UpdateAsync(
                        new User
                        {
                            Id = model.Id.Value,
                            UserName = model.UserName,
                            Email = model.EMail,
                            DisplayName = model.DisplayName
                        });

                    if (identity.Succeeded)
                        return this.RedirectToAction("Index", "Dashboard");

                    foreach (var error in identity.Errors)
                        this.ModelState.AddModelError("EMail", error);
                }
                else
                {
                    // it's a new user
                    var identity = await this.UserManager.CreateAsync(new User
                    {
                        UserName = model.UserName,
                        Email = model.EMail,
                        DisplayName = model.DisplayName
                    }, model.Password);

                    if (identity.Succeeded)
                        return this.RedirectToAction("Index", "Dashboard");

                    foreach (var error in identity.Errors)
                        this.ModelState.AddModelError("EMail", error);
                }
            }

            return this.View(model);
        }
    }
}
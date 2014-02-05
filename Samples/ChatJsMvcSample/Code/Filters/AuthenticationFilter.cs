using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Security;
using ChatJs.Net;
using ChatJsMvcSample.Code.Authentication.Principals;
using ChatJsMvcSample.Models;

namespace ChatJsMvcSample.Code.Filters
{
    public class AuthenticationFilter : IAuthorizationFilter
    {
        public bool AllowMultiple { get; private set; }

        public Task<HttpResponseMessage> ExecuteAuthorizationFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken,
            Func<Task<HttpResponseMessage>> continuation)
        {
        if (actionContext.Request.)
            {
                var userPrincipal = User as AuthenticatedPrincipal;
                if (userPrincipal == null)
                    throw new Exception("Authenticated users should be AuthenticatedPrincipal");

                if (this.db.Users.Any(m => m.Id == userPrincipal.Profile.Id))
                {
                    // in this case, the user's cookie is ok. The user exists in the database
                    var userViewModel = new UserViewModel()
                        {
                            Id = userPrincipal.Profile.Id,
                            EMail = userPrincipal.Profile.Email,
                            DisplayName = userPrincipal.Profile.Name,
                            ProfilePictureUrl =
                                GravatarHelper.GetGravatarUrl(
                                    GravatarHelper.GetGravatarHash(userPrincipal.Profile.Email),
                                    GravatarHelper.Size.s32),
                            ProfilePictureLargeUrl = GravatarHelper.GetGravatarUrl(
                            GravatarHelper.GetGravatarHash(userPrincipal.Profile.Email),
                            GravatarHelper.Size.s128)
                        };

                    this.ViewBag.CurrentUser = userViewModel;
                }
                else
                {
                    FormsAuthentication.SignOut();
                    filterContext.Result = this.RedirectToAction("Index");
                }
            }
            else
                this.ViewBag.CurrentUser = new UserViewModel()
                    {
                        IsAuthenticated = false
                    };
    }
        }
    }
}
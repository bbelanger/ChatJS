using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using ChatJsMvcSample.App_Start;
using ChatJsMvcSample.Code.Authentication;

namespace ChatJsMvcSample
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        /// <summary>
        /// Authenticates the current request.
        /// </summary>
        protected void Application_AuthenticateRequest()
        {
            var httpContext = new HttpContextWrapper(this.Context);

            // will set the current user principal and identity
            SecurityManager.SetPrincipal(httpContext);
        }
    }
}
#region

using ChatJs.Admin;
using Microsoft.Owin;
using Owin;

#endregion

[assembly: OwinStartup(typeof (Startup))]

namespace ChatJs.Admin
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            this.ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
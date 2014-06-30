#ChatJS 2.0

ChatJS is a full-featured, lightweight, Facebook style chat library for ASP.NET web applications. It contains a set of JQuery plugins written in TypeScript and a server .NET library to make it easier to integrate in your existing ASP.NET application.

How it works:
-------------

In the client, ChatJS is a set of jQuery plugins written in TypeScript. In the server, it's a simple .NET library. In order enable chat in your application, you just have to create a SignalR Hub implementing the IChatHub interface. It's really simple [(Example)](https://github.com/ChatJS/chatjs-demo/blob/master/ChatJs.Admin/Code/SignalR/ChatHub.cs).

 ChatJS comes with a full server side implementation with database access using Entity Framework and SQL Server, but it's easy to implement your own server.

 You can download the sample application [here](https://github.com/ChatJS/chatjs-demo/archive/master.zip).

 License
 -------
 ChatJS v2.0 is offered under a commercial license. During the prerelease and beta stages, all licenses are $39, with 12 months of free updates. After these, licenses will be at normal prices and free updates will be shortened to 6 months.

 How to get ChatJS up and running in your existing ASP.NET application
 --------

 **1) Setting up the references and dependencies**

Install ChatJS in your application. To do so, in the Package Manager Console, type the following instruction. This will automatically install jQuery and SignalR if necessary.

```
Install-Package ChatJS
```

**2) Make sure SignalR is properly set up**

If you didn't have SignalR installed in your application already, you need to do so. First, create a file called Startup.cs in the root folder of your application, with this content:

```cs
using ChatJs.Admin;
using Microsoft.Owin;
using Owin;
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
```

Then, you need to include the client side scripts in the pages you need ChatJS:

```html
<script src="/Scripts/jquery.signalR-2.0.3.min.js"></script>
<script src="/signalr/hubs" type="text/javascript"></script>
```

For more instructions on how to use SignalR, please refer to the [Signalr website](http://signalr.net/) and the [Getting Started tutorial](http://www.asp.net/signalr/overview/signalr-20/getting-started-with-signalr-20/tutorial-getting-started-with-signalr-20).

**3) Add a reference to the ChatJS script and style**

Add a reference to the necessary client side resources, in the pages you want to use ChatJS:

```html
<script src="/ChatJS/js/jquery.chatjs.min.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="/ChatJS/css/jquery.chatjs.css" />
```

**4) Create the SignalR Hub for ChatJS**

Create a SignalR Hub for ChatJS, implementing `IChatHub`, called `ChatHub`. Please refer to the [sample implementation](https://github.com/ChatJS/chatjs-demo/blob/master/ChatJs.Admin/Code/SignalR/ChatHub.cs).

**5) Initialize ChatJS**

```js
<script type="text/javascript">
    $(function() {
        $.chat({
            // your user information
            userId: 1, // this should be dynamic
            // text displayed when the other user is typing
            typingText: ' is typing...',
            // the title for the user's list window
            titleText: 'Chat',
            // text displayed when there's no other users in the room
            emptyRoomText: "There's no one around here. You can still open a session in another browser and chat with yourself :)",
            // the adapter you are using
            adapter: new SignalRAdapter()
        });
    });
</script>
```

 **This documentation is currently being written.**


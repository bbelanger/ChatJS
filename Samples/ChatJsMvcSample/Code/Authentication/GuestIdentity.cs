using System.Security.Principal;

namespace ChatJsMvcSample.Code.Authentication
{

    public class GuestIdentity : IIdentity {
        public GuestIdentity() { }
        public string Name { get { return "Guest"; } }
        public string AuthenticationType { get { return "Forms"; } }
        public bool IsAuthenticated { get { return false; } }
    }
}

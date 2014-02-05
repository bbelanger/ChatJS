using System.Security.Principal;

namespace ChatJsMvcSample.Code.Authentication.Principals
{
    public class AnonymousPrincipal : Principal {
        public AnonymousPrincipal(IIdentity identity) : base(identity, null) { }
    }
}

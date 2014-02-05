using System.Security.Principal;

namespace ChatJsMvcSample.Code.Authentication.Principals
{
    public class AuthenticatedPrincipal : Principal {
        public AuthenticatedPrincipal(IIdentity identity, UserData user) : base(identity, user) { }
    }
}

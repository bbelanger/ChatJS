using System;
using System.Security.Principal;

namespace ChatJsMvcSample.Code.Authentication.Principals
{
    public abstract class Principal : GenericPrincipal {
        public UserData Profile { get; private set; }

        protected Principal(IIdentity identity, UserData userProfile)
            : base(identity, new String[]{})
        {
            this.Profile = userProfile;
        }
    }
}

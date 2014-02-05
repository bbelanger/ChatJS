using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatJsMvcSample.Code.Authentication
{
    public class SecurityToken
    {
        public int Salt { get; set; }
        public UserData UserData { get; set; }
    }
}
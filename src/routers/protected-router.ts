const protectedRouter = async (pro: any, opts: any) => {
  pro.addHook("onRequest", async (request: any, reply: any) => {
    try {
      try {
        await request.jwtVerify({ onlyCookie: true });
      } catch (ex: any) {
        if (ex.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE") {
          return reply.redirect("/?message=no_cookie");
        } else {
          throw ex;
        }
      }
    } catch (err) {
      return reply.send(err);
    }
  });

  /**
   * Register Private Routes, all access must now require a token.
   */
  pro.register(require("../routes/private-route"), {
    prefix: "/main",
  });
  pro.register(require("../routes/private-api"), {
    prefix: "/main/api",
  });

  pro.register(require("../routes/supervisor-routes"), {
    prefix: "/main/supervisor",
  });
};

export default protectedRouter;

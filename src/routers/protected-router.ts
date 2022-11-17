const protectedRouter = async (pro: any, opts: any) => {
  pro.addHook("onRequest", async (request: any, reply: any) => {
    /**
     * Authorized Requests.
     */
    const qsToken = request.query.token;
    try {
      if (qsToken) {
        try {
          await pro.jwt.verify(qsToken);
        } catch (ex: any) {
          if (ex.code === "FAST_JWT_EXPIRED") {
            const { username } = pro.jwt.decode(qsToken);
            reply.redirect("/login/" + username + "?message=expired");
          } else {
            throw ex;
          }
        }
      } else {
        await request.jwtVerify();
      }
    } catch (err) {
      reply.send(err);
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

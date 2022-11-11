const mainRouter = async (main: any, opts: any) => {
  main.addHook("onSend", async function (request: any, reply: any) {
    /**
     * Disable Caching of Pages.
     *
     * For security reason all pages from here should have no cache.
     */
    reply.headers({
      "Cache-Control": "no-store",
    });
  });

  /**
   * Register Public Routes, all pages for unauthenticated access.
   */
  main.register(require("../routes/public-route"));
  main.register(require("../routes/public-api"), {
    prefix: "/api",
  });

  /**
   * Add the protected router.
   */
  main.register(require("./protected-router"));
};

export default mainRouter;

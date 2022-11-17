import "dotenv/config";
import fastify from "fastify";

/**
 * Create Fastify Instance.
 */
const app = fastify({
  logger: false,
});

/**
 * Add Security using JWT.
 */
app.register(require("./plugins/security-plugin"));

/**
 * Add Template Engine.
 */
app.register(require("./plugins/view-plugin"));

/**
 * Serve Static Files and Resources, from the public folder.
 */
app.register(require("./plugins/static-plugin"));

/**
 * Add Security Headers.
 */
app.register(require("./plugins/security-headers-plugin"));

/**
 * Add Serverless Platofrm Content Parser.
 */
app.register(require("./plugins/platform-plugin"));

/**
 * Add the main router.
 */
app.register(require("./routers/main-router"));

/**
 * Google Cloud Platform Handler.
 */
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

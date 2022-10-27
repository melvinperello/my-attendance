import "reflect-metadata";
import fastify from "fastify";

const app = fastify({
  logger: true, // you can also define the level passing an object configuration to logger: {level: 'debug'}
});
app.addContentTypeParser("application/json", {}, (req, body: any, done) => {
  done(null, body.body);
});
app.get("/", async (request, reply) => {
  reply.send({ message: "Hello World!!!" });
});

export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

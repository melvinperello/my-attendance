import "reflect-metadata";
import fastify from "fastify";
import ejs from "ejs";
import path from "path";

const app = fastify({
  logger: false, // you can also define the level passing an object configuration to logger: {level: 'debug'}
});

app.register(require("@fastify/view"), {
  engine: {
    ejs,
  },
});
app.register(require("@fastify/static"), {
  root: path.join(process.cwd(), "public"),
  prefix: "/public/", // optional: default '/'
});

// app.addContentTypeParser("application/json", {}, (req, body: any, done) => {
//   done(null, body.body);
// });
//---------------------------------------------
app.get("/", async (request, reply: any) => {
  return reply.view("/templates/index.ejs", { text: "Google is Fun!" });
});

app.post("/login", async (request: any, reply: any) => {
  return reply.send({ message: request.body });
});

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

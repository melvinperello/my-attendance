import fastifyPlugin from "fastify-plugin";
import path from "path";
const { MA_PLATFORM } = process.env;

const staticPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/static"), {
    root: path.join(process.cwd(), "public"),
    prefix: "/public/", // optional: default '/',
    maxAge: MA_PLATFORM ? 60000 * 60 * 24 * 30 : 0,
  });
};

export default fastifyPlugin(staticPlugin);

import fastifyPlugin from "fastify-plugin";
import ejs from "ejs";

const viewPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/view"), {
    engine: {
      ejs,
    },
  });
};

export default fastifyPlugin(viewPlugin);

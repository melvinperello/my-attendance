import fastifyPlugin from "fastify-plugin";
const { MA_PLATFORM } = process.env;

const platformPlugin = async (fastify: any) => {
  if (MA_PLATFORM === "gcp") {
    fastify.addContentTypeParser(
      "application/json",
      {},
      (req: any, body: any, done: any) => {
        done(null, body.body);
      }
    );
  }
};

export default fastifyPlugin(platformPlugin);

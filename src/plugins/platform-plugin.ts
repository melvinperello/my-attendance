import fastifyPlugin from "fastify-plugin";
import { isGCP } from "../utils";

const platformPlugin = async (fastify: any) => {
  if (isGCP()) {
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

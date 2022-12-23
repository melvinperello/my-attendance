import fastifyPlugin from "fastify-plugin";
import path from "path";
import { isGCP } from "../utils";

const staticPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/static"), {
    root: path.join(process.cwd(), "public"),
    prefix: "/public/", // optional: default '/',
    maxAge: isGCP() ? 60000 * 60 * 24 : 0,
  });

  const jsCache = isGCP() ? `public, max-age=${60 * 60}` : "no-store";

  //------------------------------------------------
  // JS Files are frequesntly updated
  // If old files are cached it may cause a different behavior
  //------------------------------------------------
  fastify.get("/sw.js", async function (req: any, reply: any) {
    return reply.header("Cache-Control", jsCache).sendFile("sw.js", "public/js");
  });

  fastify.get("/public/js/:js", function (req: any, reply: any) {
    const { js } = req.params;
    reply.header("Cache-Control", jsCache).sendFile(js, "public/js"); // overriding the options disabling cache-control headers
  });
};

export default fastifyPlugin(staticPlugin);

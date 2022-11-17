import fastifyPlugin from "fastify-plugin";

const securityHeadersPlugin = async (fastify: any) => {
  fastify.addHook("onSend", async function (request: any, reply: any) {
    reply.headers({
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy":
        "default-src 'self' cdn.jsdelivr.net code.jquery.com; img-src 'self' data:;",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "geolocation=(), microphone=()",
      "X-XSS-Protection": "1; mode=block",
    });
  });
};

export default fastifyPlugin(securityHeadersPlugin);

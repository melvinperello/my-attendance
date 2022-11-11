import fastifyPlugin from "fastify-plugin";
const { MA_PRIVATE_KEY, MA_PUBLIC_KEY, MA_PHRASE_KEY } = process.env;

const securityPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/jwt"), {
    secret: {
      private: {
        key: MA_PRIVATE_KEY,
        passphrase: MA_PHRASE_KEY,
      },
      public: MA_PUBLIC_KEY,
    },
    sign: { algorithm: "RS256", iss: "our-attendance", expiresIn: "15m" },
    verify: { iss: "our-attendance" },
  });
};

export default fastifyPlugin(securityPlugin);

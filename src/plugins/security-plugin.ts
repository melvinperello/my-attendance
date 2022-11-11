import fastifyPlugin from "fastify-plugin";
const { JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, JWT_KEY_PHRASE } = process.env;

const securityPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/jwt"), {
    secret: {
      private: {
        key: JWT_PRIVATE_KEY,
        passphrase: JWT_KEY_PHRASE,
      },
      public: JWT_PUBLIC_KEY,
    },
    sign: { algorithm: "RS256", iss: "our-attendance", expiresIn: "15m" },
    verify: { iss: "our-attendance" },
  });
};

export default fastifyPlugin(securityPlugin);

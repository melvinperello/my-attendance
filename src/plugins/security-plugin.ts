import fastifyPlugin from "fastify-plugin";
const {
  MA_SEC_PRIVATE_KEY,
  MA_SEC_PUBLIC_KEY,
  MA_SEC_PHRASE_KEY,
  MA_APP_NAME,
  MA_SEC_COOKIE_SECRET,
} = process.env;

const securityPlugin = async (fastify: any) => {
  fastify.register(require("@fastify/jwt"), {
    secret: {
      private: {
        key: MA_SEC_PRIVATE_KEY,
        passphrase: MA_SEC_PHRASE_KEY,
      },
      public: MA_SEC_PUBLIC_KEY,
    },
    cookie: {
      cookieName: "token",
      signed: true,
    },
    sign: { algorithm: "RS256", iss: MA_APP_NAME, expiresIn: "15m" },
    verify: { iss: MA_APP_NAME },
  });
  fastify.register(require("@fastify/cookie"), {
    secret: MA_SEC_COOKIE_SECRET,
    hook: "onRequest",
    parseOptions: {},
  });
};

export default fastifyPlugin(securityPlugin);

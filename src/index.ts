import "dotenv/config";
import fastify from "fastify";
import ejs from "ejs";
import path from "path";
import { login, check, preRegister, register } from "./fun";
const { PLATFORM, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, JWT_KEY_PHRASE } =
  process.env;

const app = fastify({
  logger: true, // you can also define the level passing an object configuration to logger: {level: 'debug'}
});
app.register(require("@fastify/jwt"), {
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

app.register(require("@fastify/view"), {
  engine: {
    ejs,
  },
});
app.register(require("@fastify/static"), {
  root: path.join(process.cwd(), "public"),
  prefix: "/public/", // optional: default '/'
});

if (PLATFORM === "gcp") {
  app.addContentTypeParser("application/json", {}, (req, body: any, done) => {
    done(null, body.body);
  });
}
//---------------------------------------------
app.get("/", async (request, reply: any) => {
  return reply.view("/templates/index.ejs");
});

app.get("/login/:username", async (request: any, reply: any) => {
  const { username } = request.params;
  const data = await check(username);
  if (data.message !== "ok" && data.message !== "user_already_associated") {
    reply.code(data.code).send(data);
  }
  return reply.view("/templates/login.ejs", { username: username });
});

app.get("/pre-register/:username", async (request: any, reply: any) => {
  const { username } = request.params;
  const data = await preRegister(username);
  if (data.code !== 200) {
    return reply.code(data.code).send(data);
  }
  return reply.code(data.code).view("/templates/pre-register.ejs", {
    ...data.data,
    username: username,
  });
});

// ---------------------------------------------------------------------------------------
// API's
// ---------------------------------------------------------------------------------------
app.post("/api/check", async (request: any, reply: any) => {
  const { username } = request.body;
  const data = await check(username);
  reply.code(data.code).send(data);
});

app.post("/api/login", async (request: any, reply: any) => {
  const { code, username } = request.body;
  const data = await login(username, code);
  if (data.code === 200 && data.message === "ok") {
    const token = await reply.jwtSign({ username });

    reply.code(data.code).send({
      ...data,
      data: {
        token,
      },
    });
  } else {
    reply.code(data.code).send(data);
  }
});

app.post("/api/register", async (request: any, reply: any) => {
  const { code, username } = request.body;
  const data = await register(username, code);
  reply.code(data.code).send(data);
});

// ---------------------------------------------------------------------------------------
// PROTECTED
// ---------------------------------------------------------------------------------------
app.register(
  function (main, opts, done) {
    main.addHook("onRequest", async (request: any, reply) => {
      const qsToken = request.query.token;
      try {
        if (qsToken) {
          // @ts-expect-error: jwt is decorated fastify expect unknown error
          await app.jwt.verify(qsToken);
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        reply.send(err);
      }
    });

    main.get("/", async (request, reply: any) => {
      return reply.view("/templates/main.ejs");
    });

    done();
  },
  {
    prefix: "/main",
  }
);

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

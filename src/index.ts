import "dotenv/config";
import fastify from "fastify";
import ejs from "ejs";
import path from "path";
import {
  login,
  check,
  preRegister,
  register,
  logAttendance,
  checkAttendance,
  groupie,
} from "./fun";
const { PLATFORM, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, JWT_KEY_PHRASE } =
  process.env;

const app = fastify({
  logger: PLATFORM ? false : true, // you can also define the level passing an object configuration to logger: {level: 'debug'}
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
  prefix: "/public/", // optional: default '/',
  maxAge: PLATFORM ? 300000 : 0,
});

if (PLATFORM === "gcp") {
  app.addContentTypeParser("application/json", {}, (req, body: any, done) => {
    done(null, body.body);
  });
}

app.addHook("onSend", async function (request, reply) {
  reply.headers({
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy":
      "default-src 'self' cdn.jsdelivr.net code.jquery.com",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=()",
    "X-XSS-Protection": "1; mode=block",
  });
});

app.register(function (isolated, opts, done) {
  isolated.addHook("onSend", async function (request, reply) {
    reply.headers({
      "Cache-Control": "no-store",
    });
  });

  isolated.get("/", async (request, reply: any) => {
    return reply.view("/templates/index.ejs");
  });

  isolated.get("/login/:username", async (request: any, reply: any) => {
    const { username } = request.params;
    const data = await check(username);
    if (data.message !== "ok" && data.message !== "user_already_associated") {
      reply.code(data.code).send(data);
    }
    return reply.view("/templates/login.ejs", { username: username });
  });

  isolated.get("/pre-register/:username", async (request: any, reply: any) => {
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
  isolated.post("/api/check", async (request: any, reply: any) => {
    const { username } = request.body;
    const data = await check(username);
    reply.code(data.code).send(data);
  });

  isolated.post("/api/login", async (request: any, reply: any) => {
    const { code, username } = request.body;
    const data = await login(username, code);
    if (data.code === 200 && data.message === "ok") {
      const token = await reply.jwtSign({ username, group: "core" });

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

  isolated.post("/api/register", async (request: any, reply: any) => {
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
            try {
              // @ts-expect-error: jwt is decorated fastify expect unknown error
              await app.jwt.verify(qsToken);
            } catch (ex: any) {
              if (ex.code === "FAST_JWT_EXPIRED") {
                // @ts-expect-error: jwt is decorated fastify expect unknown error
                const { username } = app.jwt.decode(qsToken);
                reply.redirect("/login/" + username + "?message=expired");
              } else {
                throw ex;
              }
            }
          } else {
            await request.jwtVerify();
          }
        } catch (err) {
          reply.send(err);
        }
      });

      main.get("/", async (request: any, reply: any) => {
        // @ts-expect-error: jwt is decorated fastify expect unknown error
        const { username, group } = app.jwt.decode(request.query.token);
        const data = await checkAttendance(username, group);
        if (data.code === 200) {
          // get all attendance
          const myGroupie = await groupie(group);
          console.log(myGroupie);
          return reply.view("/templates/main.ejs", {
            code: data.code,
            status: data.data.status,
            timein: data.data.timein,
            username: username,
            group: group,
            tableData: myGroupie.data,
          });
        } else {
          return reply.view("/templates/main.ejs", {
            code: data.code,
            status: "",
            timein: "",
            username: username,
            group: group,
            tableData: [],
          });
        }
      });

      main.post("/api/attendance", async (request: any, reply: any) => {
        const { selected } = request.body;
        const { username, group } = request.user;
        const data = await logAttendance(username, group, selected);
        return reply.code(data.code).send(data);
      });

      done();
    },
    {
      prefix: "/main",
    }
  );

  done();
});
//---------------------------------------------

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

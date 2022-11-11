import "dotenv/config";
import fastify from "fastify";

import {
  login,
  check,
  preRegister,
  register,
  logAttendance,
  checkAttendance,
  groupie,
} from "./fun";

const app = fastify({
  logger: false,
});

app.register(require("./plugins/security-plugin"));
app.register(require("./plugins/view-plugin"));
app.register(require("./plugins/static-plugin"));
app.register(require("./plugins/security-headers-plugin"));
app.register(require("./plugins/platform-plugin"));

app.register(require("./routes/public-route"));

app.register(function (isolated, opts, done) {
  isolated.addHook("onSend", async function (request, reply) {
    reply.headers({
      "Cache-Control": "no-store",
    });
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

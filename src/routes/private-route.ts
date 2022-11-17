import { checkAttendance, groupie } from "../fun";

const privateRoute = async (pri: any, opts: any) => {
  pri.addHook("onRequest", async (request: any, reply: any) => {
    const qsToken = request.query.token;
    try {
      if (qsToken) {
        try {
          await pri.jwt.verify(qsToken);
        } catch (ex: any) {
          if (ex.code === "FAST_JWT_EXPIRED") {
            const { username } = pri.jwt.decode(qsToken);
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

  pri.get("/", async (request: any, reply: any) => {
    const { username, group, role } = pri.jwt.decode(request.query.token);
    const data = await checkAttendance(username, group);
    if (data.code === 200) {
      // get all attendance
      const myGroupie = await groupie(group);
      return reply.view("/templates/main.ejs", {
        code: data.code,
        status: data.data.status,
        timein: data.data.timein,
        label: data.data.label,
        role,
        username: username,
        tableData: myGroupie.data,
        token: request.query.token,
      });
    } else {
      return reply.view("/templates/main.ejs", {
        code: data.code,
        status: "",
        timein: "",
        label: "",
        role,
        username: username,
        tableData: [],
        token: request.query.token,
      });
    }
  });
};

export default privateRoute;

import { check, register, login } from "../fun";

const publicApi = async (pub: any, opts: any) => {
  pub.post("/check", async (request: any, reply: any) => {
    const { username } = request.body;
    const data = await check(username);
    reply.code(data.code).send(data);
  });

  pub.post("/login", async (request: any, reply: any) => {
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

  pub.post("/register", async (request: any, reply: any) => {
    const { code, username } = request.body;
    const data = await register(username, code);
    reply.code(data.code).send(data);
  });
};

export default publicApi;

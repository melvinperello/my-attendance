import {
  check,
  register,
  login,
  saveSubscription,
  sendNotification,
} from "../fun";

const { MA_SEC_VAPID_PUBLIC_KEY } = process.env;

const publicApi = async (pub: any, opts: any) => {
  pub.get("/push-public-key", async (request: any, reply: any) => {
    return reply.code(200).send({
      key: MA_SEC_VAPID_PUBLIC_KEY,
    });
  });

  pub.post("/save-subscription", async (request: any, reply: any) => {
    const subscription = request.body;
    const data = await saveSubscription(subscription);
    return reply.code(data.code).send(data);
  });

  pub.get("/send-notification", async (request: any, reply: any) => {
    const { message } = request.query;
    const data = await sendNotification(message);
    return reply.code(data.code).send(data);
  });

  pub.post("/check", async (request: any, reply: any) => {
    const { username } = request.body;
    const data = await check(username);
    reply.code(data.code).send(data);
  });

  pub.post("/login", async (request: any, reply: any) => {
    const { code, username } = request.body;
    const data = await login(username, code);
    const group = data.data?.group || "core";
    const role = data.data?.role || "member";
    if (data.code === 200 && data.message === "ok") {
      const token = await reply.jwtSign({ username, group, role });

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

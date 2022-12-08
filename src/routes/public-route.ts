import { check, preRegister } from "../fun";

const publicRoute = async (pub: any, opts: any) => {
  pub.addHook("onRequest", async (request: any, reply: any) => {
    try {
      const { valid, renew } = reply.unsignCookie(request.cookies.token);
      if (valid && !renew) {
        return reply.redirect("/main");
      }
    } catch {
      // no-op
    }
  });

  pub.get("/", async (request: any, reply: any) => {
    try {
      const {
        valid: lastLoggedValid,
        renew: lastLoggedRenew,
        value: lastLoggedValue,
      } = reply.unsignCookie(request.cookies.last_logged);
      if (lastLoggedValid && !lastLoggedRenew) {
        return reply.redirect("/login/" + lastLoggedValue);
      }
    } catch {
      // no-op
    }

    return reply.view("/templates/index.ejs");
  });

  pub.get("/login/:username", async (request: any, reply: any) => {
    const { username } = request.params;
    const data = await check(username);
    if (data.message !== "ok" && data.message !== "user_already_associated") {
      reply.code(data.code).send(data);
    }
    return reply.view("/templates/login.ejs", { username: username });
  });

  pub.get("/pre-register/:username", async (request: any, reply: any) => {
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
};

export default publicRoute;

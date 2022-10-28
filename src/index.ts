import "reflect-metadata";
import fastify from "fastify";
import ejs from "ejs";
import path from "path";
import QRCode from "qrcode";
import { authenticator } from "otplib";

const { PLATFORM } = process.env;
const app = fastify({
  logger: false, // you can also define the level passing an object configuration to logger: {level: 'debug'}
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
  return reply.view("/templates/index.ejs", { text: "Google is Fun!" });
});

app.get("/register", async (request, reply: any) => {
  const otpauth = authenticator.keyuri(
    "melvin",
    "my-attendance",
    "AQRHIXRGFVYHUGQC"
  );
  const qrCode = await QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: "H",
    width: 200,
    scale: 10,
    margin: 2,
  });
  return reply.view("/templates/register.ejs", {
    otpImage: qrCode,
    otpString: "AQRHIXRGFVYHUGQC",
  });
});

app.post("/api/login", async (request: any, reply: any) => {
  return reply.send({ message: request.body });
});

app.post("/api/register", async (request: any, reply: any) => {
  const { code } = request.body;
  // const secret = authenticator.generateSecret(); // base32 encoded hex secret key // AQRHIXRGFVYHUGQC

  const ok = authenticator.check(code, "AQRHIXRGFVYHUGQC");
  return reply.send({ message: ok });
});

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

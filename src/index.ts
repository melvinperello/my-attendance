import fastify from "fastify";
import ejs from "ejs";
import path from "path";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { getDoc } from "./fun";
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();
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
  const document = firestore.doc('melvin/auth');

  const authDoc = await document.get();

  const doc = await getDoc('melvin/auth')
  

  if(authDoc.exists){
    const {verified} = authDoc.data();
    // user not verified.
    if(!verified){
      // create new secret.
      const secret = authenticator.generateSecret(); // base32 encoded hex secret key
      // update the secret in database.
      await document.update({
        secret: secret,
      });
      // create QR Image.
      const otpauth = authenticator.keyuri(
        "melvin",
        "my-attendance",
        secret
      );
      // create image string.
      const qrCode = await QRCode.toDataURL(otpauth, {
        errorCorrectionLevel: "H",
        width: 200,
        scale: 10,
        margin: 2,
      });
      // display site.
      return reply.view("/templates/register.ejs", {
        otpImage: qrCode,
        otpString: secret,
      });
    }
  }
});

app.post("/api/login", async (request: any, reply: any) => {
  const {username,code} = request.body;
  const document = firestore.doc(`${username}/auth`);
  const authDoc = await document.get();
  if(authDoc.exists){
    const {secret} = authDoc.data();
    const ok = authenticator.check(code, secret);
    if(ok){
      return reply.send({ message: "ok" });
    }else{
      return reply.send({ message: "not_ok" });
    }
  }else{
    return reply.send({ message: "not_found" });
  }
});

app.post("/api/register", async (request: any, reply: any) => {
  const { code } = request.body;
  // const secret = authenticator.generateSecret(); // base32 encoded hex secret key // AQRHIXRGFVYHUGQC
  const document = firestore.doc('melvin/auth');
  const authDoc = await document.get();
  if(authDoc.exists){
    const {secret} = authDoc.data();
    const ok = authenticator.check(code, secret);
    if(ok){
      await document.update({
        verified: true,
      });
      return reply.send({ message: "ok" });
    }
  }
  return reply.send({ message: "not_ok" });
});

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

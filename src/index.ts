import fastify from "fastify";
import ejs from "ejs";
import path from "path";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { login,check,preRegister,register } from "./fun";
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
  return reply.view("/templates/index.ejs");
});

app.get("/login/:username", async (request:any, reply: any) => {
  const { username } = request.params;
  const data = await check(username)
  if(data.message !== "ok" && data.message !== "user_already_associated"){
    reply.code(data.code).send(data);
  }
  return reply.view("/templates/login.ejs",{username: username});
});

app.get("/pre-register/:username", async (request:any, reply: any) => {
  const { username } = request.params;
  const data = await preRegister(username)
  if(data.code !== 200){
    reply.code(data.code).send(data);
  }
  return reply.code(data.code).view("/templates/pre-register.ejs", {
    ...data.data,
    username:username
  });
});


// ---------------------------------------------------------------------------------------
// API's
// ---------------------------------------------------------------------------------------
app.post("/api/check", async (request: any, reply: any) => {
  const {username} = request.body;
  const data = await check(username)
  reply.code(data.code).send(data);
});

app.post("/api/login", async (request: any, reply: any) => {
  const {code,username} = request.body;
  const data = await login(username,code)
  reply.code(data.code).send(data);
});

app.post("/api/register", async (request: any, reply: any) => {
  const { code,username } = request.body;
  const data = await register(username,code);
  reply.code(data.code).send(data);
  
});

//---------------------------------------------
export const fastifyFunction = async (request: any, reply: any) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
export default app;

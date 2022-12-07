// import "dotenv/config";
import { createEnvironment } from "./environment";

let appInstance: any = null;

const getAppInstance = async () => {
  if (!appInstance) {
    await createEnvironment();
    appInstance = (await import("./app")).default;
  }
  return appInstance;
};

/**
 * Google Cloud Platform Handler.
 */
export const fastifyFunction = async (request: any, reply: any) => {
  const app = await getAppInstance();
  await app.ready();
  app.server.emit("request", request, reply);
};

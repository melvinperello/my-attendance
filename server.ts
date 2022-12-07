import { createEnvironment } from "./src/environment";
(async () => {
  await createEnvironment();
  const app = (await import("./src/app")).default;
  app.listen({ port: 8080 }, function (err: any, address: any) {
    console.log("== LOCAL SERVER STARTED ==");
  });
})();

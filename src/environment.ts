import * as dotenv from "dotenv";
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const smClient = new SecretManagerServiceClient();

export const createEnvironment = async () => {
  console.info("[Environment] Creating . . .");
  dotenv.config();
  const { MA_SECRET_NAME } = process.env;

  if (MA_SECRET_NAME && MA_SECRET_NAME !== "") {
    const [version] = await smClient.accessSecretVersion({
      name: MA_SECRET_NAME,
    });
    const envString = version.payload.data.toString();
    const env = dotenv.parse(Buffer.from(envString));
    process.env = { ...process.env, ...env };
    console.info("[Environment] Using Remote . . .");
  } else {
    console.info("[Environment] Using Local . . .");
  }

  console.info("[Environment] Created . . .");
};

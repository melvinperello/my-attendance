import * as dotenv from "dotenv";
dotenv.config();
const { MA_SECRET_NAME } = process.env;
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const smClient = new SecretManagerServiceClient();

export const createEnvironment = async () => {
  console.info("[Environment] Creating . . .");
  const [version] = await smClient.accessSecretVersion({
    name: MA_SECRET_NAME,
  });
  const envString = version.payload.data.toString();
  const env = dotenv.parse(Buffer.from(envString));
  process.env = { ...process.env, ...env };
  console.info("[Environment] Created . . .");
};

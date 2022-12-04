import * as dotenv from "dotenv";
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const smClient = new SecretManagerServiceClient();

export const createEnvironment = async () => {
  console.info("[Environment] Creating . . .");
  const [version] = await smClient.accessSecretVersion({
    name: "projects/146520701588/secrets/our-attendance-env/versions/latest",
  });
  const envString = version.payload.data.toString();
  const env = dotenv.parse(Buffer.from(envString));
  process.env = { ...process.env, ...env };
  console.info("[Environment] Created . . .");
};

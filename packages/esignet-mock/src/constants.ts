import { cleanEnv, port, str, url } from "envalid";
import { join } from "node:path";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 20260 }),
  HOST: str({ default: "0.0.0.0", devDefault: "localhost" }),
  OIDP_CLIENT_PRIVATE_KEY_PATH: str({
    devDefault: join(__dirname, "../../../certs/esignet-jwk.txt"),
  }),
});

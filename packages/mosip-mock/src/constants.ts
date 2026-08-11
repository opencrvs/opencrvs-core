import { bool, cleanEnv, email, port, str } from "envalid";
import { join } from "node:path";
import fs from "node:fs";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 20240 }),
  HOST: str({ default: "0.0.0.0", devDefault: "localhost" }),
  ISSUER_URL: str({
    devDefault: "http://localhost:20240",
    example: "https://mosip-mock.mosip.opencrvs.dev",
    desc: "This is the issuer of the verifiable credential without a `/`.",
  }),
  SENDER_EMAIL_ADDRESS: email({
    default: "noreply@opencrvs.org",
    desc: "The email address that will be used to send emails such as mock NID card and NID (de)activation.",
  }),

  PRIVATE_KEY_PATH: str({
    default: join(__dirname, "./mock-only-private-key.pem"),
  }),

  /*
   * SMTP configuration to send mock NID card and NID (de)activation emails
   */
  ALERT_EMAIL: str({
    devDefault: undefined,
    desc: "The email address that will be used to send alert emails.",
  }),
  SMTP_HOST: str({
    devDefault: undefined,
    desc: "The SMTP host. The email details are used to send emails such as mock NID card and NID (de)activation.",
  }),
  SMTP_PORT: port({ devDefault: undefined }),
  SMTP_USERNAME: str({ devDefault: undefined }),
  SMTP_PASSWORD: str({ devDefault: undefined }),
  SMTP_SECURE: bool({ devDefault: false }),

  /**
   * MOSIP WebSub hub
   */
  MOSIP_WEBSUB_TOPIC: str({
    default: "CREDENTIAL_ISSUED",
    desc: "The Kafka topic that is listened for ID credential issuance",
  }),
  MOSIP_WEBSUB_CALLBACK_URL: str({
    devDefault: "http://localhost:2024/websub/callback",
    desc: "The URL where @opencrvs/mosip/mosip-api receives WebSub callbacks from MOSIP",
  }),
});

export const PRIVATE_KEY = fs.readFileSync(env.PRIVATE_KEY_PATH).toString();

export const EMAIL_ENABLED = Boolean(env.SMTP_HOST);

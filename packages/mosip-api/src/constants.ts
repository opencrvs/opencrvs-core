import { bool, cleanEnv, str, port, url } from "envalid";
import { join } from "node:path";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 2024 }),
  HOST: str({ default: "0.0.0.0", devDefault: "localhost" }),
  LOCALE: str({ devDefault: "en" }),
  SQLITE_DATABASE_PATH: str({
    devDefault: join(__dirname, "../../../data/sqlite/mosip-api.db"),
    example: "/data/sqlite/mosip-api.db", // A good production default, but needs a Docker volume
    desc: "Path to the SQLite database used to store a OpenCRVS record-only token with the MOSIP transaction ID. Note that you need to add a volume to the Docker container to persist the data.",
  }),
  CLIENT_APP_URL: url({
    devDefault: "http://localhost:3000",
    desc: "OpenCRVS client app URL for CORS",
  }),
  OPENCRVS_GATEWAY_URL: str({
    devDefault: "http://localhost:7070",
    desc: "The URL of the OpenCRVS GraphQL Gateway",
  }),
  OPENCRVS_PUBLIC_KEY_URL: str({
    devDefault: "http://localhost:4040/.well-known",
    desc: "OpenCRVS public key URL. Used to verify JWT authenticity",
  }),
  OPENCRVS_AUTH_URL: str({
    devDefault: "http://localhost:4040",
    desc: "OpenCRVS auth service URL. Used to obtain tokens with the integration's own client credentials",
  }),
  OPENCRVS_CLIENT_ID: str({
    default: "",
    desc: "Client ID of this integration's OpenCRVS system client. A National System Admin obtains it from the OpenCRVS Integrations page (Reveal keys). When set together with OPENCRVS_CLIENT_SECRET, registration confirmations authenticate with a freshly issued token instead of the one stored at registration time, so they survive OpenCRVS redeployments and are audited as this integration.",
  }),
  OPENCRVS_CLIENT_SECRET: str({
    default: "",
    desc: "Client secret of this integration's OpenCRVS system client. A National System Admin obtains it from the OpenCRVS Integrations page (Refresh secret).",
  }),

  // MOSIP Auth manager
  MOSIP_AUTH_URL: str({
    devDefault:
      "http://localhost:20240/v1/authmanager/authenticate/clientidsecretkey",
  }),
  MOSIP_AUTH_CLIENT_APP_ID: str({ default: "admin" }),
  MOSIP_PACKET_AUTH_CLIENT_ID: str({ devDefault: "mosip-regproc-client" }),
  MOSIP_PACKET_AUTH_CLIENT_SECRET: str({ devDefault: "abcdeABCDE123456" }),

  // MOSIP WebSub hub
  MOSIP_WEBSUB_HUB_URL: url({
    devDefault: "http://localhost:20240/websub/hub",
    desc: "MOSIP WebSub hub URL",
  }),
  MOSIP_WEBSUB_SECRET: str({
    devDefault: "mosip-websub-secret",
    desc: "MOSIP WebSub `hub.secret`",
  }),
  MOSIP_WEBSUB_TOPIC: str({
    devDefault: "CREDENTIAL_ISSUED",
    desc: "The Kafka topic that is listened for ID credential issuance, `hub.topic`",
  }),
  MOSIP_WEBSUB_CALLBACK_URL: str({
    devDefault: "http://localhost:2024/websub/callback",
    example: "https://your-domain.com/websub/callback",
    desc: "The OpenCRVS side URL MOSIP sends WebSub updates to, `hub.callback`",
  }),
  MOSIP_VERIFIABLE_CREDENTIAL_ALLOWLIST: str({
    devDefault: "http://localhost:20240/.well-known/public-key.json",
    example: "https://your-domain.com/.well-known/public-key.json",
    desc: "Comma-separated list of verifiable credential allowlist URLs. Used to verify the authenticity of the verifiable credential.",
  }),
  MOSIP_VERIFIABLE_CREDENTIAL_NATIONAL_ID_KEY: str({
    default: "UIN",
    desc: "The key used to fill NATIONAL_ID field in OpenCRVS",
  }),
  MOSIP_WEBSUB_AUTH_CLIENT_ID: str({ devDefault: "mosip-websub-client" }),
  MOSIP_WEBSUB_AUTH_CLIENT_SECRET: str({ devDefault: "abcdeABCDE123456" }),

  // MOSIP Birth & Death packets
  TRANSACTION_ID_PREFIX: str({
    default: "10001",
    desc: "Used to prefix the numeric transaction ID (1000101234567890) that is sent to MOSIP and received back",
  }),

  // E-Signet
  ESIGNET_USERINFO_URL: url({
    devDefault: "http://localhost:20260/oidc/userinfo",
  }),
  ESIGNET_TOKEN_URL: url({ devDefault: "http://localhost:20260/oauth/token" }),
  OPENID_PROVIDER_CLAIMS: str({ devDefault: undefined }),
  OIDP_CLIENT_PRIVATE_KEY_PATH: str({
    devDefault: join(__dirname, "../certs/esignet-jwk.txt"),
  }),

  // NOTE: Following files and credentials are generally created by MOSIP and their assistance.
  // MOSIP Auth
  PARTNER_APIKEY: str({ devDefault: "123456" }),
  PARTNER_MISP_LK: str({
    devDefault: "aaaaaAAAAAbbbbbBBBBBcccccCCCCCdddddDDDDD",
  }),
  PARTNER_ID: str({ devDefault: "crvs-partner" }),

  // MOSIP IDA auth server
  IDA_AUTH_DOMAIN_URI: str({ devDefault: "http://localhost:20240" }),
  IDA_AUTH_URL: str({
    devDefault: "http://localhost:20240/idauthentication/v1/auth",
  }),

  // MOSIP Crypto encrypt
  ENCRYPT_CERT_PATH: str({
    devDefault: join(__dirname, "../certs/ida-partner.crt"),
  }),
  DECRYPT_P12_FILE_PATH: str({
    devDefault: join(__dirname, "../certs/keystore.p12"),
  }),
  DECRYPT_P12_FILE_PASSWORD: str({ devDefault: "mosip123" }),

  // MOSIP Crypto signature
  SIGN_P12_FILE_PATH: str({
    devDefault: join(__dirname, "../certs/keystore.p12"),
  }),
  SIGN_P12_FILE_PASSWORD: str({ devDefault: "mosip123" }),

  // MOSIP packet manager details
  MOSIP_CREATE_PACKET_URL: str({
    devDefault: "http://localhost:20240/commons/v1/packetmanager/createPacket",
  }),
  MOSIP_PROCESS_PACKET_URL: str({
    devDefault:
      "http://localhost:20240/registrationprocessor/v1/workflowmanager/workflowinstance",
  }),
  MOSIP_CENTER_ID: str({
    devDefault: "10001",
  }),
  MOSIP_MACHINE_ID: str({
    devDefault: "10004",
  }),

  // Debug
  UNSAFE_DEBUG_LOG: bool({
    default: false,
    desc: "Enable debug logging for requests and payloads",
  }),
});

export const MOSIP_VERIFIABLE_CREDENTIAL_ALLOWED_URLS =
  env.MOSIP_VERIFIABLE_CREDENTIAL_ALLOWLIST.split(",");

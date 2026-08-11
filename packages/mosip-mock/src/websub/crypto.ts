import crypto from "node:crypto";

/**
 * Encrypts a payload using AES-256-GCM and RSA-OAEP (SHA-256) to match MOSIP-style format.
 * @param payload - The JSON-serializable object to encrypt.
 * @param publicKeyPem - Recipient's RSA public key in PEM format.
 * @returns Base64-encoded encrypted credential.
 */
export function encryptMosipCredential(
  payload: string,
  publicKeyPem: string,
  options?: {
    versionBytes?: Buffer;
    thumbprintBytes?: Buffer;
  },
): string {
  const version = options?.versionBytes ?? Buffer.from("VER_R2");
  const thumbprint = options?.thumbprintBytes ?? Buffer.alloc(32, 0); // 32 bytes dummy

  const plaintext = Buffer.from(payload, "utf-8");

  // 1. Generate AES session key and IV
  const sessionKey = crypto.randomBytes(32); // 256-bit
  const iv = crypto.randomBytes(12);
  const aadSuffix = crypto.randomBytes(20); // 32 - 12 = 20
  const aad = Buffer.concat([iv, aadSuffix]);

  // 2. Encrypt the payload using AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", sessionKey, iv);
  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const encryptedContent = Buffer.concat([aad, ciphertext, authTag]);

  // 3. Encrypt session key using RSA-OAEP with SHA-256
  const encryptedSessionKey = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    sessionKey,
  );

  // 4. Construct full message
  const encryptedKeyPart = Buffer.concat([
    version,
    thumbprint,
    encryptedSessionKey,
  ]);
  const fullPayload = Buffer.concat([
    encryptedKeyPart,
    Buffer.from("#KEY_SPLITTER#"),
    encryptedContent,
  ]);

  return fullPayload.toString("base64");
}

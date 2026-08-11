import crypto from "node:crypto";

const SYMMETRIC_NONCE_SIZE = 128 / 8;

const asymmetricDecrypt = (
  encryptedAesKeyB64: string,
  privateKeyPkcs8: string,
) => {
  const privateKey = crypto.createPrivateKey(privateKeyPkcs8);
  const encryptedBuffer = Buffer.from(encryptedAesKeyB64, "base64url");

  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedBuffer,
  );
};

const symmetricDecrypt = (encryptedB64Data: string, key: Buffer) => {
  const encryptedData = Buffer.from(encryptedB64Data, "base64url");
  const nonce = encryptedData.slice(-SYMMETRIC_NONCE_SIZE);
  const tag = encryptedData.slice(
    -SYMMETRIC_NONCE_SIZE - 16,
    -SYMMETRIC_NONCE_SIZE,
  );
  const encrypted = encryptedData.slice(0, -SYMMETRIC_NONCE_SIZE - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf-8",
  );
};

export const decryptAuthData = (
  encryptedAuthB64Data: string,
  encryptedAesKeyB64: string,
  privateKeyPem: string,
) => {
  const aesKey = asymmetricDecrypt(encryptedAesKeyB64, privateKeyPem);
  const authData = symmetricDecrypt(encryptedAuthB64Data, aesKey);

  return JSON.parse(authData);
};

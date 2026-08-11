import * as crypto from "node:crypto";
import * as jose from "jose";
import { base64Encode, padBase64 } from "./utils";
import forge from "node-forge";

export const getPemCertificateThumbprint = (pemCertificate: string) => {
  const fingerprint = new crypto.X509Certificate(pemCertificate).fingerprint256; // In "node:crypto", this gives the SHA-256 fingerprint as a hexadecimal string
  return Buffer.from(fingerprint.replace(/:/g, ""), "hex");
};

export const urlSafeCertificateThumbprint = (pemCertificate: string) =>
  padBase64(getPemCertificateThumbprint(pemCertificate).toString("base64url"));

const SYMMETRIC_NONCE_SIZE = 128 / 8;
const SYMMETRIC_KEY_LENGTH = 256;

/** Symmetrically (allows to be decrypted by the same key) encrypts the data */
const symmetricEncrypt = (data: Buffer, key: Buffer) => {
  const nonce = crypto.randomBytes(SYMMETRIC_NONCE_SIZE);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce, {
    authTagLength: 16,
  });

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([encrypted, tag, nonce]);
};

/**
 * Asymmetrically (allowed to be decrypted by the partner certificate) encrypts the data
 */
const asymmetricEncrypt = (
  aesKey: Buffer,
  encryptPemCertificate: string,
): Buffer => {
  const cert = forge.pki.certificateFromPem(encryptPemCertificate);
  const publicKey = cert.publicKey as forge.pki.rsa.PublicKey; // Explicitly cast to RSA public key

  const encryptedKey = publicKey.encrypt(
    aesKey.toString("binary"),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
      label: Buffer.alloc(0), // Explicitly set an empty label
    },
  );

  return Buffer.from(encryptedKey, "binary");
};

export const encryptAuthData = (
  data: string,
  encryptPemCertificate: string,
) => {
  // Generate a random AES Key and encrypt Auth Request Data using the generated random key.
  const aesKey = crypto.randomBytes(SYMMETRIC_KEY_LENGTH / 8);

  const encryptedData = symmetricEncrypt(Buffer.from(data, "utf-8"), aesKey);
  const encryptedAuthB64Data = padBase64(encryptedData.toString("base64url"));

  // Encrypt the randomly generated key using the IDA partner certificate
  const encryptedAesKey = asymmetricEncrypt(aesKey, encryptPemCertificate);
  const encryptedAesKeyB64 = encryptedAesKey.toString("base64url");

  // Generate SHA256 hash for the Auth Request Data
  const sha256Hash = crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .toUpperCase();
  const authDataHashBuffer = Buffer.from(sha256Hash, "utf-8");
  const encryptedAuthDataHash = symmetricEncrypt(authDataHashBuffer, aesKey);
  const encryptedAuthDataHashBase64 = padBase64(
    encryptedAuthDataHash.toString("base64url"),
  );

  return {
    encryptedAuthB64Data,
    encryptedAesKeyB64,
    encryptedAuthDataHashBase64,
  };
};

export async function signAuthRequestData(
  authRequestData: string,
  encryptPemCertificate: string,
  signPemPrivateKey: string,
  signPemCertificate: string,
  algorithm = "RS256",
) {
  const protectedHeader = {
    alg: algorithm,
    x5c: [base64Encode(signPemCertificate)],
  };

  const unprotectedHeader = {
    kid: crypto
      .createHash("sha256")
      .update(encryptPemCertificate)
      .digest("base64url"),
  };

  const privateKey = await jose.importPKCS8(signPemPrivateKey, algorithm);

  const flattenedSign = await new jose.FlattenedSign(
    Buffer.from(authRequestData, "utf-8"),
  )
    .setProtectedHeader(protectedHeader)
    .setUnprotectedHeader(unprotectedHeader)
    .sign(privateKey);

  const parts = [
    flattenedSign.protected,
    "", // No payload in this case
    flattenedSign.signature,
  ];
  return `${parts[0]}..${parts[2]}`;
}

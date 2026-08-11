import {
  encryptAuthData,
  extractKeysFromPkcs12,
  signAuthRequestData,
  urlSafeCertificateThumbprint,
} from "./crypto";
import fs from "node:fs";
import crypto from "node:crypto";

interface MOSIPAuthenticatorConfig {
  partnerApiKey: string;
  partnerMispLk: string;
  partnerId: string;
  idaAuthDomainUri: string;
  idaAuthUrl: string;
  encryptCertPath: string;
  decryptP12FilePath: string;
  decryptP12FilePassword: string;
  signP12FilePath: string;
  signP12FilePassword: string;
}

type IdentityInfo = { value: string; language: string };

interface AuthParams {
  individualId: string;
  individualIdType: string;
  demographicData: {
    dob?: string;
    name?: IdentityInfo[];
    gender?: IdentityInfo[];
  };
  consent: boolean;
}

export default class MOSIPAuthenticator {
  private encryptPemCertificate: string;
  private signPemPrivateKey: string;
  private signPemCertificate: string;

  constructor(private config: MOSIPAuthenticatorConfig) {
    this.encryptPemCertificate = fs
      .readFileSync(this.config.encryptCertPath)
      .toString();

    const p12fileContents = fs.readFileSync(
      this.config.signP12FilePath,
      "binary",
    );
    const { privateKeyPkcs8, certificate } = extractKeysFromPkcs12(
      p12fileContents,
      this.config.signP12FilePassword,
    );

    this.signPemPrivateKey = privateKeyPkcs8;
    this.signPemCertificate = certificate;
  }

  async auth(params: AuthParams) {
    const requestData = {
      id: "mosip.identity.auth",
      version: "1.0",
      individualId: params.individualId,
      individualIdType: params.individualIdType,
      transactionID: `${crypto.randomInt(10 ** 9, 10 ** 10)}`,
      requestTime: new Date().toISOString(),
      specVersion: "1.0",
      thumbprint: urlSafeCertificateThumbprint(this.encryptPemCertificate),
      domainUri: this.config.idaAuthDomainUri,
      env: "Staging",
      requestedAuth: {
        demo: false,
        pin: false,
        otp: false,
        bio: false,
      },
      consentObtained: true,
    };

    const authData = {
      biometrics: [],
      demographics: params.demographicData,
      otp: "",
      timestamp: new Date().toISOString(),
    };

    const {
      encryptedAuthB64Data,
      encryptedAesKeyB64,
      encryptedAuthDataHashBase64,
    } = encryptAuthData(JSON.stringify(authData), this.encryptPemCertificate);

    const fullRequestJson = JSON.stringify({
      ...requestData,
      request: encryptedAuthB64Data,
      requestSessionKey: encryptedAesKeyB64,
      requestHMAC: encryptedAuthDataHashBase64,
    });

    const signatureHeader = await signAuthRequestData(
      fullRequestJson,
      this.encryptPemCertificate,
      this.signPemPrivateKey,
      this.signPemCertificate,
    );

    const fullIdaAuthUrl = `${this.config.idaAuthUrl}/${this.config.partnerMispLk}/${this.config.partnerId}/${this.config.partnerApiKey}`;

    return fetch(fullIdaAuthUrl, {
      method: "POST",
      body: fullRequestJson,
      headers: {
        Authorization: "Authorization",
        "content-type": "application/json",
        Signature: signatureHeader,
      },
    });
  }
}

import { flattenedVerify, importSPKI } from "jose";
import { z } from "zod";
import canonicalize from "canonicalize";
import { env } from "../constants";

const BirthSubject = z.looseObject({
  id: z.string().url(),
  [env.MOSIP_VERIFIABLE_CREDENTIAL_NATIONAL_ID_KEY]: z.string(),
});

export const getBirthIdentifier = (credentialSubject: BirthSubject) => {
  if (env.MOSIP_VERIFIABLE_CREDENTIAL_NATIONAL_ID_KEY in credentialSubject) {
    return credentialSubject[env.MOSIP_VERIFIABLE_CREDENTIAL_NATIONAL_ID_KEY];
  } else {
    throw new Error(
      `Invalid birth credential subject. Available keys: ${Object.keys(credentialSubject).join(", ")}`,
    );
  }
};

export type BirthSubject = z.infer<typeof BirthSubject>;

const DeathSubject = z.object({
  id: z.string().url(),
  vcVer: z.literal("VC-V1"),
});

export type DeathSubject = z.infer<typeof DeathSubject>;

export const MOSIPVerifiableCredential = z.object({
  issuanceDate: z.string().datetime(),
  credentialSubject: z.union([BirthSubject, DeathSubject]),
  id: z.string().url(),
  proof: z.object({
    type: z.string(),
    created: z.string().datetime(),
    proofPurpose: z.string(),
    verificationMethod: z.string().url(),
    jws: z.string(),
  }),
  type: z.tuple([
    z.literal("VerifiableCredential"),
    z.literal("MOSIPVerifiableCredential"),
  ]),
  "@context": z.tuple([
    z.literal("https://www.w3.org/2018/credentials/v1"),
    z.string().endsWith("/.well-known/mosip-context.json"),
    z.object({ sec: z.literal("https://w3id.org/security#") }),
  ]),
  issuer: z.string().url(),
});

export const isBirthSubject = (
  subject: z.infer<typeof BirthSubject> | z.infer<typeof DeathSubject>,
): subject is z.infer<typeof BirthSubject> => {
  return env.MOSIP_VERIFIABLE_CREDENTIAL_NATIONAL_ID_KEY in subject;
};

export const verifyCredentialOrThrow = async (
  credential: z.infer<typeof MOSIPVerifiableCredential>,
  { allowList }: { allowList: string[] },
) => {
  const { jws, verificationMethod } = credential.proof;
  const { proof, ...payload } = credential;

  if (!allowList.includes(verificationMethod)) {
    throw new Error("❌ Verification method not allowed");
  }

  const res = await fetch(verificationMethod);
  /*
   * Response.json() is typed as unknown, and this key is what the credential's
   * signature is checked against, so the shape is validated rather than cast.
   */
  const { publicKeyPem } = z
    .object({ publicKeyPem: z.string() })
    .parse(await res.json());
  const key = await importSPKI(publicKeyPem, "PS256");

  const [encodedHeader, , encodedSignature] = jws.split(".");

  const canonicalPayload = canonicalize(payload);
  const payloadBytes = new TextEncoder().encode(canonicalPayload);

  await flattenedVerify(
    {
      protected: encodedHeader,
      payload: payloadBytes,
      signature: encodedSignature,
    },
    key,
  );
};

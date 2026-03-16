import { env } from "./constants";
import { createClient } from "@opencrvs/toolkit/api";
import crypto from "node:crypto";
import type { FastifyBaseLogger } from "fastify";

export class OpenCRVSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenCRVSError";
  }
}

/** Fetches the public key from OpenCRVS to be able to verify JWTs */
export const getPublicKey = async (
  logger: FastifyBaseLogger,
): Promise<string> => {
  try {
    const response = await fetch(env.OPENCRVS_PUBLIC_KEY_URL);
    return response.text();
  } catch (error) {
    logger.warn(
      {
        event: "opencrvs.public-key.fetch.failed",
        opencrvsPublicKeyUrl: env.OPENCRVS_PUBLIC_KEY_URL,
        err: error,
      },
      "Failed to fetch OpenCRVS public key",
    );

    if (env.isProd) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    return getPublicKey(logger);
  }
};

export const confirmRegistration = (
  {
    eventId,
    actionId,
    nationalId,
    registrationNumber,
  }: {
    eventId: string;
    actionId: string;
    nationalId?: string;
    registrationNumber: string;
  },
  { token }: { token: string },
) => {
  const url = new URL("events", env.OPENCRVS_GATEWAY_URL).toString();
  const client = createClient(url, `Bearer ${token}`);

  return client.event.actions.register.accept.mutate({
    transactionId: `mosip-interop-${crypto.randomUUID()}`,
    eventId,
    actionId,
    registrationNumber,
    declaration: {
      "child.nid": nationalId,
    },
  });
};

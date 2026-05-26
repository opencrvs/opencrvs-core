import { env } from "./constants";
import { createClient } from "@opencrvs/toolkit/api";
import crypto from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import { EventDocument, getPendingAction } from "@opencrvs/toolkit/events";

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
  { token, logger }: { token: string; logger?: FastifyBaseLogger },
) => {
  const url = new URL("events", env.OPENCRVS_GATEWAY_URL).toString();
  const client = createClient(url, `Bearer ${token}`);

  logger?.debug(
    {
      event: "opencrvs.registration.confirm.request",
      eventId,
      actionId,
      registrationNumber,
    },
    "Confirming OpenCRVS registration",
  );

  return client.event.actions.register.accept
    .mutate({
      transactionId: `mosip-interop-${crypto.randomUUID()}`,
      eventId,
      actionId,
      registrationNumber,
      declaration: {
        "child.nid": nationalId,
      },
    })
    .catch((err: unknown) => {
      logger?.warn(
        {
          event: "opencrvs.registration.confirm.failed",
          err,
          eventId,
          actionId,
          registrationNumber,
        },
        "Failed to confirm OpenCRVS registration",
      );
      throw err;
    });
};

export const findEventActionType = async (
  eventId: string,
  { token }: { token: string },
) => {
  const url = new URL("events", env.OPENCRVS_GATEWAY_URL).toString();
  const client = createClient(url, `Bearer ${token}`);

  const event = (await client.event.get.query({ eventId })) as EventDocument;

  let action: ReturnType<typeof getPendingAction>;
  try {
    action = getPendingAction(event.actions);
  } catch {
    return null;
  }

  return {
    actionType: action.type,
    eventType: event.type,
    requestId:
      action.type === "APPROVE_CORRECTION" ? action.requestId : undefined,
  };
};

export const confirmApprovedBirthCorrection = (
  {
    eventId,
    actionId,
    requestId,
    nationalId,
  }: {
    eventId: string;
    actionId: string;
    requestId: string;
    nationalId: string;
  },
  { token, logger }: { token: string; logger?: FastifyBaseLogger },
) => {
  const url = new URL("events", env.OPENCRVS_GATEWAY_URL).toString();
  const client = createClient(url, `Bearer ${token}`);

  logger?.debug(
    {
      event: "opencrvs.birth-correction.confirm.request",
      eventId,
      actionId,
      requestId,
    },
    "Confirming approved OpenCRVS birth correction",
  );

  return client.event.actions.correction.approve.accept
    .mutate({
      transactionId: `mosip-interop-${crypto.randomUUID()}`,
      eventId,
      actionId,
      requestId,
      declaration: {
        "child.nid": nationalId,
      },
    })
    .catch((err: unknown) => {
      logger?.warn(
        {
          event: "opencrvs.birth-correction.confirm.failed",
          err,
          eventId,
          actionId,
          requestId,
        },
        "Failed to confirm approved OpenCRVS birth correction",
      );
      throw err;
    });
};

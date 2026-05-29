import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { getTransactionAndDiscard } from "../database";
import { decode } from "jsonwebtoken";
import * as opencrvs from "../opencrvs-api";
import { decryptMosipCredential } from "../websub/crypto";
import { env } from "../constants";
import { getBirthIdentifier } from "../websub/verify-vc";
import { ActionType } from "@opencrvs/toolkit/events";

export const CredentialIssuedSchema = z.object({
  publisher: z.string(),
  topic: z.literal(env.MOSIP_WEBSUB_TOPIC),
  publishedOn: z.string().datetime(),
  event: z.object({
    id: z.string().uuid(),
    transactionId: z.string().uuid(),
    type: z.object({
      namespace: z.string(),
      name: z.string(),
    }),
    timestamp: z.string().datetime(),
    data: z.object({
      registrationId: z.string(),
      credential: z.string(),
      credentialType: z.literal("vercred").or(z.literal("euin")),
      protectionKey: z.string(),
    }),
  }),
});

export interface TokenPayload {
  eventId: string;
  actionId: string;
}

type CredentialIssuedRequest = FastifyRequest<{
  Body: z.infer<typeof CredentialIssuedSchema>;
}>;

export const credentialIssuedHandler = async (
  request: CredentialIssuedRequest,
  reply: FastifyReply,
) => {
  try {
    const verifiableCredential = decryptMosipCredential(
      request.body.event.data.credential,
    );

    // NOTE! Be cautious with UNSAFE_DEBUG_LOG as it may log sensitive information. Make sure to disable it in production or when handling real data.
    if (env.UNSAFE_DEBUG_LOG) {
      request.log.info(
        {
          event: "websub.credential-issued.debug",
          verifiableCredential,
        },
        "Decrypted verifiable credential",
      );
    }

    // commented out for now, as there is an issue when verifying the VC, likely due to canonicalization differences
    // await verifyCredentialOrThrow(verifiableCredential, {
    //   allowList: MOSIP_VERIFIABLE_CREDENTIAL_ALLOWED_URLS,
    // });

    const transactionId = verifiableCredential.credentialSubject.id
      .split("/")
      .pop()!;

    const { token, registrationNumber } =
      getTransactionAndDiscard(transactionId);
    const { eventId, actionId } = decode(token) as TokenPayload;
    const actionInfo = await opencrvs.findEventActionType(eventId, { token });

    if (!actionInfo) {
      request.log.info(
        {
          event: "websub.credential-issued.no-pending-action",
          eventId,
        },
        "No pending action for event, skipping credential processing",
      );
      return reply
        .send({
          publisher: request.body.publisher,
          topic: request.body.topic,
          publishedOn: new Date().toISOString(),
          event: {
            id: request.body.event.id,
            requestId: request.body.event.transactionId,
            timestamp: new Date().toISOString(),
            status: "RECEIVED",
            url: "",
          },
        })
        .status(200);
    }

    const { actionType, eventType, requestId } = actionInfo;

    if (actionType === ActionType.REGISTER && eventType === "birth") {
      await opencrvs.confirmRegistration(
        {
          eventId,
          actionId,
          registrationNumber,
          nationalId: getBirthIdentifier(
            verifiableCredential.credentialSubject,
          ),
        },
        { token, logger: request.log },
      );
    }

    if (actionType === ActionType.REGISTER && eventType === "death") {
      await opencrvs.confirmRegistration(
        {
          eventId,
          actionId,
          registrationNumber,
        },
        { token, logger: request.log },
      );
    }

    if (actionType === ActionType.APPROVE_CORRECTION && eventType === "birth") {
      await opencrvs.confirmApprovedBirthCorrection(
        {
          eventId,
          actionId,
          requestId: requestId!,
          nationalId: getBirthIdentifier(
            verifiableCredential.credentialSubject,
          ),
        },
        { token, logger: request.log },
      );
    }

    return reply
      .send({
        publisher: request.body.publisher,
        topic: request.body.topic,
        publishedOn: new Date().toISOString(),
        event: {
          id: request.body.event.id,
          requestId: request.body.event.transactionId,
          timestamp: new Date().toISOString(),
          status: "RECEIVED",
          url: "",
        },
      })
      .status(200);
  } catch (error) {
    request.log.error(
      {
        event: "websub.credential-issued.failed",
        err: error,
        topic: request.body.topic,
        eventId: request.body.event.id,
      },
      "Failed to process WebSub credential-issued event",
    );

    return reply
      .send({
        publisher: request.body.publisher,
        topic: request.body.topic,
        publishedOn: new Date().toISOString(),
        event: {
          id: request.body.event.id,
          requestId: request.body.event.transactionId,
          timestamp: new Date().toISOString(),
          status: "ERROR",
          url: "",
        },
      })
      .status(200);
  }
};

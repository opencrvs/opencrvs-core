import { FastifyRequest, FastifyReply } from "fastify";
import * as mosip from "../mosip-api";
import { insertTransaction } from "../database";
import { MosipInteropPayloadSchema } from "@opencrvs/mosip/api";
import { env } from "../constants";

const generateTransactionId = (prefix = env.TRANSACTION_ID_PREFIX) => {
  return `${prefix}${Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("")}`;
};

/** Handles the calls coming from OpenCRVS countryconfig */
export const registrationEventHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const body = MosipInteropPayloadSchema.parse(request.body);

  const {
    trackingId,
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification,
  } = body;

  const token = request.headers.authorization!.split(" ")[1];

  request.log.info({ trackingId }, "Received record from OpenCRVS");

  const birthCertificateNumber = requestFields.birthCertificateNumber;

  if (birthCertificateNumber) {
    const transactionId = generateTransactionId();

    request.log.info({ transactionId }, "Event ID");

    insertTransaction(transactionId, token, birthCertificateNumber);

    await mosip.postBirthRecord({
      event: { id: transactionId, trackingId },
      requestFields,
      schemaJson,
      audit,
      metaInfo,
      notification,
    });
  }

  const deathCertificateNumber = requestFields.deathCertificateNumber;

  if (deathCertificateNumber) {
    const transactionId = generateTransactionId();

    request.log.info({ transactionId }, "Event ID");

    insertTransaction(transactionId, token, deathCertificateNumber);

    await mosip.postDeathRecord({
      event: { id: transactionId, trackingId },
      requestFields,
      schemaJson,
      audit,
      metaInfo,
      notification,
    });
  }

  return reply.code(202).send({});
};

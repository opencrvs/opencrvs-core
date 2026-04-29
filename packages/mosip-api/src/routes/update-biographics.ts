import { FastifyRequest, FastifyReply } from "fastify";
import * as mosip from "../mosip-api";
import crypto from "node:crypto";
import { z } from "zod";

const MosipCorrectionPayloadSchema = z.object({
  trackingId: z.string(),
  notification: z.object({
    recipientFullName: z.string(),
    recipientEmail: z.string(),
    recipientPhone: z.string(),
  }),
  requestFields: z.object({
    VID: z.string(),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    introducerInfoToken: z.string().optional(),
  }),
  schemaJson: z.string().optional(),
  metaInfo: z.record(z.string(), z.unknown()),
  audit: z.record(z.string(), z.unknown()),
});

export const updateBiographicsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const body = MosipCorrectionPayloadSchema.parse(request.body);

  const {
    trackingId,
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification,
  } = body;

  request.log.info({ trackingId }, "Received correction update from OpenCRVS");

  await mosip.postDemographicUpdateRecord({
    event: { id: crypto.randomUUID(), trackingId },
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification,
  });

  return reply.code(202).send({});
};

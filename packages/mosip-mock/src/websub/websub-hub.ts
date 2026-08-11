import { RouteHandlerMethod } from "fastify";
import { env } from "../constants";
import crypto from "node:crypto";

/** Handles WebSub subscription coming from OpenCRVS */
export const webSubHubHandler: RouteHandlerMethod = async (_request, reply) => {
  const challengeToken = crypto.randomUUID();
  const response = await fetch(
    `${env.MOSIP_WEBSUB_CALLBACK_URL}?hub.challenge=${challengeToken}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      `❌ Failed to send challenge to OpenCRVS: ${response.status} ${response.statusText}`,
    );
  }

  const challenge = await response.text();

  if (challenge !== challengeToken) {
    throw new Error(
      `❌ Challenge mismatch. Expected: ${challengeToken}, got: ${challenge}`,
    );
  }

  return reply.type("text/plain").status(200).send("Subscribed successfully.");
};

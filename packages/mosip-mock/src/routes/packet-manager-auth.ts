import { RouteHandlerMethod } from "fastify";

export const packetManagerAuthHandler: RouteHandlerMethod = async (
  _request,
  reply,
) => {
  const token = "some-token";
  reply.header(
    "set-cookie",
    `Authorization=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
  );

  return reply.status(200).send({
    id: "string",
    version: "string",
    responsetime: new Date().toISOString(),
    metadata: null,
    response: {
      status: "Success",
      message: "Clientid and Token combination had been validated successfully",
    },
    errors: null,
  });
};

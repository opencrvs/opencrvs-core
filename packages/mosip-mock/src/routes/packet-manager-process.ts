import { RouteHandlerMethod } from "fastify";

export const packetManagerProcessHandler: RouteHandlerMethod = async (
  _request,
  reply,
) => {
  return reply.status(200).send({
    id: "mosip.registration.processor.workflow.instance",
    version: "v1",
    responsetime: new Date().toISOString(),
    response: {
      workflowInstanceId: "dd9f218b-279c-4d93-8cda-9857976293ea",
    },
    errors: null,
  });
};

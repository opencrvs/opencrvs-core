import { RouteHandlerMethod } from "fastify";
import identities from "../mock-identities.json" assert { type: "json" };
import { decryptAuthData } from "./crypto";
import { PRIVATE_KEY } from "../constants";

export const idAuthenticationHandler: RouteHandlerMethod = async (
  request,
  reply,
) => {
  const {
    individualId,
    transactionID,
    request: requestBody,
    requestSessionKey,
  } = request.body as {
    transactionID: string;
    individualId: string;
    individualIdType: "UIN" | "VID";
    request: string;
    requestSessionKey: string;
  };

  const authParams = decryptAuthData(
    requestBody,
    requestSessionKey,
    PRIVATE_KEY,
  );

  const identity = identities.find(({ nid }) => nid === individualId);

  if (!identity) {
    return reply.status(200).send({
      transactionID,
      version: "1.0",
      id: "mosip.identity.auth",
      errors: [
        {
          errorCode: "IDA-MLC-002",
          errorMessage: "Invalid UIN",
          actionMessage: "Please retry with the correct UIN",
        },
      ],
      responseTime: new Date().toISOString(),
      response: { authStatus: false, authToken: null },
    });
  }

  const authToken = new Array({ length: 36 })
    .map(() => Math.floor(Math.random() * 10))
    .join("");

  if (
    authParams.demographics.name[0].value.toLocaleLowerCase() !==
    `${identity.firstName} ${identity.familyName}`.toLocaleLowerCase()
  ) {
    return {
      transactionID,
      version: "1.0",
      id: "mosip.identity.auth",
      errors: [
        {
          errorCode: "IDA-DEA-001",
          errorMessage: "Demographic data name in eng did not match",
          actionMessage: "Please re-enter your name in eng",
        },
      ],
      responseTime: new Date().toISOString(),
      response: {
        authStatus: false,
        authToken,
      },
    };
  }

  if (authParams.demographics.dob !== identity.birthDate.replaceAll("-", "/")) {
    return {
      transactionID,
      version: "1.0",
      id: "mosip.identity.auth",
      errors: [
        {
          errorCode: "IDA-DEA-001",
          errorMessage: "Demographic data dob did not match",
          actionMessage: "Please re-enter your dob",
        },
      ],
      responseTime: new Date().toISOString(),
      response: {
        authStatus: false,
        authToken,
      },
    };
  }

  if (
    authParams.demographics.gender?.[0] &&
    authParams.demographics.gender[0].value !== identity.gender
  ) {
    return {
      transactionID,
      version: "1.0",
      id: "mosip.identity.auth",
      errors: [
        {
          errorCode: "IDA-DEA-001",
          errorMessage: "Demographic data gender in eng did not match",
          actionMessage: "Please re-enter your gender in eng",
        },
      ],
      responseTime: new Date().toISOString(),
      response: {
        authStatus: false,
        authToken,
      },
    };
  }

  return reply.status(200).send({
    transactionID,
    version: "1.0",
    id: "mosip.identity.auth",
    responseTime: new Date().toISOString(),
    response: {
      authStatus: true,
      authToken,
    },
  });
};

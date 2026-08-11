import { env } from "../constants";
import { getMosipAuthToken } from "../mosip-api";

/**
 * Initializes the WebSub subscription to a MOSIP Kafka topic. Throws if not successful.
 * The WebSub eventually informs about a successful credential issuance.
 */
export const initWebSub = async () => {
  const authToken = await getMosipAuthToken("WEBSUB");

  const response = await fetch(env.MOSIP_WEBSUB_HUB_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `${authToken}`,
      Cookie: `Authorization=${authToken}`,
    },
    body: new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.topic": env.MOSIP_WEBSUB_TOPIC,
      "hub.callback": env.MOSIP_WEBSUB_CALLBACK_URL,
      "hub.secret": env.MOSIP_WEBSUB_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to subscribe to topic '${env.MOSIP_WEBSUB_TOPIC}': ${response.status} ${await response.text()}`,
    );
  }

  return {
    topic: env.MOSIP_WEBSUB_TOPIC,
    response: await response.text(),
  };
};

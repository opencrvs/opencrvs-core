import { sendEmail } from "./mailer";
import identities from "./mock-identities.json" assert { type: "json" };

export const deactivateNid = async (nid: string) => {
  if (identities.some((identity) => identity.nid === nid)) {
    sendEmail(`NID deactivated for ${nid}`, `NID deactivated: ${nid}`);
  } else {
    sendEmail(`NID not found for ${nid}`, `NID not found: ${nid}`);
  }
};

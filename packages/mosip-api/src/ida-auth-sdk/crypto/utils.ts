// The receiving end expects a URL safe Base64 encoding in many places
// In addition to that, it also expects it to be padded with ='s to the nearest 4 character chunk, which base64url in Node.js doesn't do by default

export const padBase64 = (str: string) =>
  str + "=".repeat((4 - (str.length % 4)) % 4);

export const base64Encode = (input: string) =>
  Buffer.from(input, "utf8").toString("base64url");

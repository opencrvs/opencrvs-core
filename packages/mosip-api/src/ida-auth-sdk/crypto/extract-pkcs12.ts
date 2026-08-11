import { asn1, pkcs12, pki } from "node-forge";

/**
 * Reads and extracts private key and certificate from a PKCS#12 file.
 * @param filePath - The path to the PKCS#12 (.p12) file.
 * @param password - The password for decrypting the PKCS#12 file.
 * @returns An object containing the private key and certificate in PEM format.
 */
export const extractKeysFromPkcs12 = (
  fileContents: string,
  password: string,
) => {
  const p12Asn1 = asn1.fromDer(fileContents);
  const p12Object = pkcs12.pkcs12FromAsn1(p12Asn1, password);

  let privateKeyPkcs8: pki.PEM | null = null;
  let certificate: pki.PEM | null = null;

  // Extract private key and certificate
  p12Object.safeContents.forEach((safeContent) => {
    safeContent.safeBags.forEach((safeBag) => {
      if (safeBag.type === pki.oids.pkcs8ShroudedKeyBag && safeBag.key) {
        // To return PKCS#1:
        // privateKeyPkcs1 = pki.privateKeyToPem(safeBag.key);
        const privateKeyAsn1 = pki.privateKeyToAsn1(safeBag.key);
        const privateKeyPkcs8Asn1 = pki.wrapRsaPrivateKey(privateKeyAsn1);
        privateKeyPkcs8 = pki.privateKeyInfoToPem(privateKeyPkcs8Asn1);
      } else if (safeBag.type === pki.oids.certBag && safeBag.cert) {
        certificate = pki.certificateToPem(safeBag.cert);
      }
    });
  });

  if (privateKeyPkcs8 === null)
    throw new Error("PEM private key not available in keystore");

  if (certificate === null)
    throw new Error("PEM certificate not available in keystore");

  return { privateKeyPkcs8, certificate } as {
    privateKeyPkcs8: pki.PEM;
    certificate: pki.PEM;
  };
};

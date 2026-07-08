/**
 * JWT VC payload data for a paper birth credential.
 *
 * This interface mirrors the `credentialData` structure produced by
 * `paperBirthCredentialTemplate` for issuance.
 */
export interface PaperBirthCredentialData {
  /** Birth registration number. */
  rn: string
  /** Child given name. */
  gn: string
  /** Child family name. */
  fn: string
  /** Birth date in ISO 8601 (YYYY-MM-DD) format. */
  dob: string
}

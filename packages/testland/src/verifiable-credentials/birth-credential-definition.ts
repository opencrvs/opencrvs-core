/**
 * SD-JWT VC payload data for a birth credential.
 *
 * This interface mirrors the `credentialData` structure produced by
 * `birthCredentialTemplate` for issuance.
 */
export interface BirthCredentialData {
  /**
   * Child's given name (first name).
   */
  given_name: string
  /**
   * Child's middle name.
   */
  middle_name?: string
  /**
   * Child's family name (surname).
   */
  family_name: string
  /**
   * Legal birth registration number assigned by CRVS.
   */
  registration_number: string
  /**
   * Birth date in ISO 8601 (YYYY-MM-DD) format.
   */
  birthdate: string
  /**
   * Place of birth details.
   */
  place_of_birth: {
    /**
     * Facility and locality where the child was born.
     */
    name: string
    /**
     * ISO 3166-1 alpha-3 country code.
     */
    country: string
  }
  /**
   * List of nationality country codes.
   */
  nationalities: string[]
  /**
   * Sex code (0 = not known; 1 = male; 2 = female; 9 = not applicable. For values 0, 1, 2 and 9, ISO/IEC 5218 applies.).
   */
  sex: number
  /**
   * Parent details in the order [mother, father].
   */
  parents: Array<{
    /** Parent given name. */
    given_name?: string
    /** Parent middle name. */
    middle_name?: string
    /** Parent family name. */
    family_name?: string
    /** Parent national identifier if available. */
    identifier?: string
    /** Parent nationality codes. */
    nationalities: string[]
  }>
}

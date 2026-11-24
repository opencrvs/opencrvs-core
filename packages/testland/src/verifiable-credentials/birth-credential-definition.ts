/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
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

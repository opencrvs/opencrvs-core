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
// Shared across regression specs for every event type (birth, death, ...) -
// see the QA regression-test sheet: each event has its own tab.
// https://docs.google.com/spreadsheets/d/1g0ReIDGw8lbHC6Am3O0A16S1y0jje8BZ

import { expect } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { createDeclaration as registerBirthForBrn } from '../test-data/birth-declaration'
import { getToken } from '../../helpers'

/**
 * Registers a birth via the API purely to mint a real registration number,
 * for declarations where a family member is identified by an existing BRN.
 */
export async function fetchBirthRegistrationNumberForTesting() {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await registerBirthForBrn(token)
  expect(res.registrationNumber).toBeDefined()
  return res.registrationNumber!
}

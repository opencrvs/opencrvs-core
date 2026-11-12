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
import { expect, test } from '@playwright/test'
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import {
  createVersionedRecord,
  getActionMenuOptions
} from '@e2e/support/form-versions'
import { ActionType } from '@opencrvs/toolkit/events'

/* The labels come from the CSV translations, which write them in lowercase. */
const INITIAL_ONLY_ACTION = 'initial only action'
const V2_ONLY_ACTION = 'v2 only action'

test.describe('Custom actions of a birth version', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test("A record of version 'initial' offers the initial only action", async ({
    page
  }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const { declaration } = await createVersionedRecord(
      token,
      BirthVersion.INITIAL
    )

    const options = await getActionMenuOptions(page, declaration)
    expect(options).toContain(INITIAL_ONLY_ACTION)
    expect(options).not.toContain(V2_ONLY_ACTION)
  })

  test("A record of version 'v2' with a single birth offers neither action", async ({
    page
  }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const { declaration } = await createVersionedRecord(
      token,
      BirthVersion.V2,
      ActionType.REGISTER,
      { 'child.birthType': 'SINGLE' }
    )

    const options = await getActionMenuOptions(page, declaration)
    expect(options).not.toContain(INITIAL_ONLY_ACTION)
    expect(options).not.toContain(V2_ONLY_ACTION)
  })

  test("A record of version 'v2' with a multiple birth offers the v2 only action", async ({
    page
  }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const { declaration } = await createVersionedRecord(
      token,
      BirthVersion.V2,
      ActionType.REGISTER,
      { 'child.birthType': 'TWIN' }
    )

    const options = await getActionMenuOptions(page, declaration)
    expect(options).toContain(V2_ONLY_ACTION)
    expect(options).not.toContain(INITIAL_ONLY_ACTION)
  })
})

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
import { expect, type Page } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { GATEWAY_HOST } from '@e2e/support/constants'
import { searchFromSearchBar } from '@e2e/support/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  createDeclaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'

/** The labels that the version picker shows for each birth version. */
export const BirthVersionLabel = {
  [BirthVersion.INITIAL]: 'Initial',
  [BirthVersion.V2]: 'V2'
} as const

/**
 * Opens the event selection page, picks birth and the version with
 * `versionLabel`, and continues to the introduction page.
 */
export async function startBirthDeclaration(
  page: Page,
  versionLabel?: (typeof BirthVersionLabel)[BirthVersion]
) {
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  if (versionLabel) {
    await page.getByLabel(versionLabel, { exact: true }).click()
  }
  await page.getByRole('button', { name: 'Continue' }).click()
}

/**
 * Builds a birth declaration that fits `version`. Version `initial` requires
 * the mother's marital status, and version `v2` does not have that field.
 */
export async function getVersionedDeclaration(
  token: string,
  version: BirthVersion,
  partialDeclaration: Record<string, unknown> = {}
) {
  return getDeclaration({
    token,
    // Any informant other than the mother needs the informant's own details.
    informantRelation:
      partialDeclaration['informant.relation'] &&
      partialDeclaration['informant.relation'] !== 'MOTHER'
        ? 'LEGAL_GUARDIAN'
        : 'MOTHER',
    partialDeclaration: {
      ...(version === BirthVersion.INITIAL
        ? { 'mother.maritalStatus': 'MARRIED' }
        : {}),
      ...partialDeclaration
    }
  })
}

/** Creates a birth record under `version` through the events API. */
export async function createVersionedRecord(
  token: string,
  version: BirthVersion,
  action: ActionType = ActionType.REGISTER,
  partialDeclaration: Record<string, unknown> = {}
) {
  const declaration = await getVersionedDeclaration(
    token,
    version,
    partialDeclaration
  )
  return createDeclaration(
    token,
    declaration,
    action,
    undefined,
    undefined,
    version
  )
}

/** Reads the id of the configuration version that the record was created under. */
export async function getConfigVersionId(token: string, eventId: string) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const event = await client.event.get.query({ eventId })
  return event.configVersionId
}

/** Opens the record of `declaration` and returns the options of its Action menu. */
export async function getActionMenuOptions(
  page: Page,
  declaration: { 'child.name': { firstname: string; surname: string } }
) {
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = page.locator('#action-Dropdown-Content li')
  await expect(options.first()).toBeVisible()
  return options.allTextContents()
}

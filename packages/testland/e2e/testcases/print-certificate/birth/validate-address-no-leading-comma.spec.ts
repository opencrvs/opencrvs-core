import { test, type Page, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import {
  Declaration,
  createDeclaration,
  getDeclaration
} from '../../test-data/birth-declaration'
import { getSignatureFile, uploadFile } from '../../test-data/utils'
import { login, getToken, searchFromSearchBar } from '../../../helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../../constants'
import { selectCertificationType, selectRequesterType } from './helpers'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { formatV2ChildName } from '../../birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'
import { createClient } from '@opencrvs/toolkit/api'

/**
 * Regression test for https://github.com/opencrvs/opencrvs-core/issues/12274
 *
 * Steps from the issue:
 * 1. k.mweene (district registrar) declares
 * 2. m.owen (provincial registrar, Central Province — no district) registers
 * 3. c.lungu (registrar general) prints
 *
 * legalStatuses.REGISTERED.createdAtLocation comes from m.owen's office which only
 * has province + country (no district). The old SVG template produced
 * ", Central, Farajaland". Fixed by $join which filters empty levels.
 */
test.describe
  .serial('Registration location renders without leading comma for province-level registrar', () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    // Step 1: k.mweene declares
    const registrarToken = await getToken(CREDENTIALS.REGISTRAR)
    const dec = await getDeclaration({
      token: registrarToken,
      placeOfBirthType: 'HEALTH_FACILITY'
    })
    const { eventId } = await createDeclaration(
      registrarToken,
      dec,
      ActionType.DECLARE
    )

    // Step 2: m.owen (provincial registrar, Central Province — no district) registers.
    // This sets legalStatuses.REGISTERED.createdAtLocation to province-level only.
    const provincialToken = await getToken(CREDENTIALS.PROVINCIAL_REGISTRAR)
    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${provincialToken}`
    )

    // Decode JWT to get m.owen's user ID for the assign call
    const userId = JSON.parse(
      Buffer.from(provincialToken.split('.')[1], 'base64').toString()
    ).sub

    await client.event.actions.assignment.assign.mutate({
      eventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: userId
    })

    const signature = await uploadFile(getSignatureFile(), provincialToken)

    const registerRes = await client.event.actions.register.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: dec,
      annotation: { 'review.comment': '', 'review.signature': signature }
    })

    const registerAction = registerRes.actions.find(
      (a: any) => a.type === ActionType.REGISTER
    )
    declaration = (registerAction as any).declaration as Declaration

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('c.lungu logs in as registrar general', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  test('Search for the record and navigate to certified copy print preview', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Registration location renders without leading comma', async () => {
    // m.owen's office is Central Province (no district).
    // Before the fix: rendered as ", Central, Farajaland".
    // After the fix ($join): renders as "Central, Farajaland".
    // Registration location shows "Central, Farajaland" (no leading comma).
    // If $join wasn't registered, the field would be blank and this would fail.
    await expect(page.locator('#print')).toContainText(
      'Central Province Office'
    )
    await expect(page.locator('#print')).toContainText('Central, Farajaland')
  })
})

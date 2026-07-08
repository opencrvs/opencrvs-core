import { Page } from '@playwright/test'
import { Declaration } from '../../test-data/death-declaration'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { CREDENTIALS } from '../../../constants'
import { openRecordByTitle } from '../birth/helpers'

export async function selectCertificationType(page: Page, type: string) {
  await page.locator('#certificateTemplateId svg').click()
  await page
    .locator('.react-select__menu')
    .getByText(type, { exact: true })
    .click()
}

export async function selectRequesterType(page: Page, type: string) {
  await page.locator('#collector____requesterId').click()
  await page.getByText(type, { exact: true }).click()
}

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: Declaration,
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
) {
  const deceasedName = `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
  await openRecordByTitle(page, deceasedName)

  await ensureAssignedToUser(page, username)
  await selectAction(page, 'Print')
}

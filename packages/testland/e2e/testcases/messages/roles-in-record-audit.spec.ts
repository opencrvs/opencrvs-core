import { expect, test } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { getToken, login, switchEventTab } from '../../helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser } from '../../utils'
import { formatV2ChildName } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

const testCases = [
  {
    credential: CREDENTIALS.HOSPITAL_OFFICIAL,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Hospital Official'
  },
  {
    credential: CREDENTIALS.REGISTRATION_OFFICER,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Registration Officer'
  },
  {
    credential: CREDENTIALS.REGISTRAR,
    action: ActionType.REGISTER,
    expectedAuditRole: 'Registrar'
  }
]

test.describe('Roles in Record Audit', () => {
  for (const { credential, expectedAuditRole, action } of testCases) {
    test(expectedAuditRole, async ({ browser }) => {
      const page = await browser.newPage()
      const token = await getToken(credential)
      const res = await createDeclaration(token, undefined, action)

      await login(page, CREDENTIALS.REGISTRAR)

      await expect(page.locator('#content-name')).toHaveText(
        'Assigned to you',
        {
          timeout: 90000
        }
      )

      await expect(async () => {
        await page
          .getByRole('textbox', { name: 'Search for a record' })
          .fill(formatV2ChildName(res.declaration))
        await page.getByRole('button', { name: 'Search' }).click()

        await expect(
          page.getByRole('button', {
            name: formatV2ChildName(res.declaration),
            exact: true
          })
        ).toBeVisible({ timeout: 5_000 })
      }).toPass({
        timeout: 60_000,
        intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
      })

      await openRecordByTitle(page, formatV2ChildName(res.declaration))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await switchEventTab(page, 'Audit')

      await expect(page.locator('#row_0')).toContainText(expectedAuditRole)
    })
  }
})

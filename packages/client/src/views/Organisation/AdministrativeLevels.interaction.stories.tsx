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
import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within, expect } from '@storybook/test'
import { TestUserRole } from '@opencrvs/commons/client'
import { routesConfig } from '@client/v2-events/routes'
import { formatUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import { OrganisationPage } from '@client/v2-events/features/organisation/Organisation'

const meta: Meta<typeof OrganisationPage> = {
  title: 'Organisation/Interaction'
}

export default meta

type Story = StoryObj<typeof OrganisationPage>

export const PaginationResetsOnTabNavigation: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: formatUrl(routes.ORGANISATIONS_INDEX, { locationId: '' })
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Navigate to Central province', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Central' }))
    })

    await step('Navigate to Ibombo district', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Ibombo' }))
    })

    await step('Go to page 2 (Ibombo has 12 locations, triggering pagination)', async () => {
      // Page 2 button has id="page-number-1" (index 1). querySelector picks the desktop instance.
      await userEvent.click(
        canvasElement.querySelector<HTMLElement>('#page-number-1')!
      )
    })

    await step('Click Organisation tab to navigate back to root', async () => {
      await userEvent.click(
        canvasElement.querySelector('#navigation_organisation')!
      )
    })

    await step('Organisation root list should be visible', async () => {
      await expect(await canvas.findByRole('button', { name: 'Central' })).toBeVisible()
      await expect(await canvas.findByRole('button', { name: 'Sulaka' })).toBeVisible()
    })
  }
}

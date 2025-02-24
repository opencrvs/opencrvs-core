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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { within } from '@storybook/test'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import * as Request from './index'

const meta: Meta<typeof Request.Pages> = {
  title: 'Declare',
  beforeEach: () => {
    useEventFormData.getState().clear()
  }
}

export default meta

type Story = StoryObj<typeof Request.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const Page: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: tennisClueMembershipEventDocument.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  }
}

export const Review: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: tennisClueMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  }
}

export const FilledPagesVisibleInReview: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Address/)

    await step(
      'Admin structure dropdowns are shown gradually as the inputs are filled',
      async () => {
        // Verify that `District` select is not visible initially
        await expect(canvas.queryByTestId('location__district')).toBeNull()

        // Select a province
        const province = await canvas.findByTestId('location__province')
        await userEvent.click(province)
        await selectEvent.select(province, 'Central')

        // Verify that `District` becomes visible
        const district = await canvas.findByTestId('location__district')
        await expect(district).toBeInTheDocument()

        // Select a district
        await userEvent.click(district)
        await selectEvent.select(district, 'Ibombo')
      }
    )

    await step(
      'Selecting "Rural" for address details type hides detailed street information',
      async () => {
        // Click on the "RURAL" radio option
        const ruralRadio = await canvas.findByTestId('radio-option__RURAL')
        await userEvent.click(ruralRadio)

        // Verify that the "village" input appears
        const villageInput = await canvas.findByTestId('text__village')
        await expect(villageInput).toBeInTheDocument()
      }
    )
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: 'ADDRESS',
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            },
            defaultValue: {
              country: 'FAR'
            }
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

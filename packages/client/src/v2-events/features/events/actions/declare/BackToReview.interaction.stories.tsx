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
import { expect, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  FieldConfig,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { localDraftStore } from '@client/v2-events/features/drafts/useDrafts'
import { useEventFormData } from '../../useEventFormData'
import { useActionAnnotation } from '../../useActionAnnotation'
import { Pages } from './index'

const generator = testDataGenerator()

// Use an undeclared draft event assigned to the current user for tests
const undeclaredDraftEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.ASSIGN,
      user: { assignedTo: generator.user.id.localRegistrar }
    }
  ]
})

const meta: Meta<typeof Pages> = {
  title: 'Declare/Interaction',
  parameters: {
    offline: {
      events: [undeclaredDraftEvent]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
    useActionAnnotation.setState({})
    localDraftStore.getState().setDraft(null)
  }
}

export default meta

type Story = StoryObj<typeof Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const membershipTypeFieldConfig: FieldConfig = {
  id: 'applicant.membershipType',
  label: {
    id: 'event.tennis-club-membership.action.declare.form.section.who.field.membershipType.label',
    defaultMessage: 'Membership type',
    description: 'This is the label for the field'
  },
  required: false,
  conditionals: [],
  secured: false,
  validation: [],
  hideLabel: false,
  uncorrectable: false,
  analytics: false,
  defaultValue: 'Gold',
  type: 'TEXT'
}

const eventConfigWithDefaultValue = {
  ...tennisClubMembershipEvent,
  declaration: {
    ...tennisClubMembershipEvent.declaration,
    pages: tennisClubMembershipEvent.declaration.pages.map((page, index) => {
      if (index === 0) {
        return {
          ...page,
          fields: [...page.fields, membershipTypeFieldConfig]
        }
      }
      return page
    })
  }
}

export const GoToReviewStoresDefaultValues: Story = {
  name: 'Default values are flushed to form state when going directly to review',
  parameters: {
    offline: {
      events: [undeclaredDraftEvent],
      configs: [eventConfigWithDefaultValue]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return undeclaredDraftEvent
          }),
          tRPCMsw.event.search.query(() => {
            return { results: [], total: 0 }
          })
        ]
      }
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Who is applying for the membership?/)

    await step(
      'Default value is computed into the form field but not yet in the form state',
      async () => {
        await expect(
          await canvas.findByTestId('text__applicant____membershipType')
        ).toHaveValue('Gold')

        await expect(
          useEventFormData.getState().formValues?.['applicant.membershipType']
        ).toBeUndefined()
      }
    )

    await step('Navigate directly to review', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Go to review' })
      )
    })

    await step(
      'Computed default value was flushed to the form state and is visible in review',
      async () => {
        await waitFor(async () =>
          expect(
            useEventFormData.getState().formValues?.['applicant.membershipType']
          ).toBe('Gold')
        )

        await canvas.findByText('Membership type')
        await canvas.findByText('Gold')
      }
    )
  }
}

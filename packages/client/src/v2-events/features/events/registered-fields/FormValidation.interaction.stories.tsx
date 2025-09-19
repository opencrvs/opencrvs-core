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
import { expect, userEvent, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'

import selectEvent from 'react-select-event'
import {
  ActionType,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useValidationFunctionsWithContext } from '@client/v2-events/hooks/useConditionals'
import { Pages } from '../components/Pages'
import { useEventFormData } from '../useEventFormData'
import { tennisClubMembershipEventDocument } from '../fixtures'

const createdEvent = {
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions.filter(
    ({ type }) => type === ActionType.CREATE || type === ActionType.ASSIGN
  )
}

const meta: Meta<typeof Pages> = {
  title: 'Inputs/Validation/Interaction',
  parameters: {
    offline: {
      events: [createdEvent]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
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

const parameters = {
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
      eventId: createdEvent.id,
      pageId: 'applicant'
    })
  },
  chromatic: { disableSnapshot: true },
  msw: {
    handlers: {
      events: [
        tRPCMsw.event.config.get.query(() => {
          return [tennisClubMembershipEvent]
        })
      ],
      workqueues: [
        tRPCMsw.workqueue.config.list.query(() => {
          return generateWorkqueues()
        }),
        tRPCMsw.workqueue.count.query((input) => {
          return input.reduce((acc, { slug }) => {
            return { ...acc, [slug]: 7 }
          }, {})
        })
      ],
      event: [
        tRPCMsw.event.get.query(() => {
          return createdEvent
        }),
        tRPCMsw.event.search.query((input) => {
          return {
            results: [
              useValidationFunctionsWithContext().getCurrentEventState(
                createdEvent,
                tennisClubMembershipEvent
              )
            ],
            total: 1
          }
        })
      ]
    }
  }
}

export const DeclareForm: Story = {
  parameters,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector(
        '#applicant____name-form-input #firstname_error'
      )
    ).toBe(null)
    await expect(
      canvasElement.querySelector(
        '#applicant____name-form-input #surname_error'
      )
    ).toBe(null)
    await expect(canvasElement.querySelector('#applicant____dob_error')).toBe(
      null
    )
    await expect(
      canvasElement.querySelector(
        '#applicant____address-form-input #country_error'
      )
    ).toBe(null)

    const canvas = within(canvasElement)
    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)

    const backButton = await canvas.findByText('Back')
    await userEvent.click(backButton)

    await expect(
      canvasElement.querySelector(
        '#applicant____name-form-input #firstname_error'
      )
    ).toHaveTextContent('Required')
    await expect(
      canvasElement.querySelector(
        '#applicant____name-form-input #surname_error'
      )
    ).toHaveTextContent('Required')
    await expect(
      canvasElement.querySelector('#applicant____dob_error')
    ).toHaveTextContent('Required')
    await expect(
      canvasElement.querySelector(
        '#applicant____address-form-input #country_error'
      )
    ).toHaveTextContent('Required')
  }
}

export const CountryDomestic: Story = {
  parameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const country = await canvas.findByTestId('location__country')
    await userEvent.click(country)
    await selectEvent.select(country, 'Bangladesh')

    await expect(canvasElement.querySelector('#province_error')).toBe(null)

    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)

    const backButton = await canvas.findByText('Back')
    await userEvent.click(backButton)

    await expect(
      canvasElement.querySelector('#province_error')
    ).toHaveTextContent('Required')
  }
}

export const CountryInternational: Story = {
  parameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const country = await canvas.findByTestId('location__country')
    await userEvent.click(country)
    await selectEvent.select(country, 'Finland')

    await expect(canvasElement.querySelector('#state_error')).toBe(null)
    await expect(canvasElement.querySelector('#district2_error')).toBe(null)

    const continueButton = await canvas.findByText('Continue')
    await userEvent.click(continueButton)

    const backButton = await canvas.findByText('Back')
    await userEvent.click(backButton)

    await expect(canvasElement.querySelector('#state_error')).toHaveTextContent(
      'Required'
    )
    await expect(
      canvasElement.querySelector('#district2_error')
    ).toHaveTextContent('Required')
  }
}

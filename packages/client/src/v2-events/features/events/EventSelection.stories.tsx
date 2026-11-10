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
import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import {
  ActionType,
  generateEventDocument,
  toVersionedEventConfig,
  tennisClubMembershipEvent,
  VersionedEventConfig
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventSelection } from './EventSelection'
import { addLocalEventConfig } from './useEvents/api'

const meta: Meta<typeof EventSelection> = {
  title: 'EventSelection',
  component: EventSelection,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventSelection>

const tokenWithCreateScopeForAllEventTypes =
  testDataGenerator().user.token.registrationAgent

const birthConfig = {
  ...tennisClubMembershipEvent,
  id: 'birth',
  label: {
    id: 'birth',
    defaultMessage: 'Birth',
    description: 'birth'
  }
}

// This is not shown because it is not in the scope
const randomConfig = {
  ...tennisClubMembershipEvent,
  id: 'foo',
  label: {
    id: 'foo',
    defaultMessage: 'Foo',
    description: 'Foo'
  }
}

export const EventSelectionWithCreateScopeForAllEventTypes: Story = {
  beforeEach: () => {
    addLocalEventConfig(toVersionedEventConfig(birthConfig))
    addLocalEventConfig(toVersionedEventConfig(randomConfig))
  },
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        tokenWithCreateScopeForAllEventTypes
      )

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const [initialVersion] = toVersionedEventConfig(birthConfig).versions

/** Birth with a past version 'initial' and the current version 'v2'. Listed newest first, to check the order. */
const birthWithTwoVersions: VersionedEventConfig = {
  ...toVersionedEventConfig(birthConfig),
  versions: [
    {
      ...initialVersion,
      id: 'v2',
      label: { id: 'v2', defaultMessage: 'V2', description: 'Version v2' },
      // Before the date that the preview mocks as today (2025-08-12)
      effectiveFrom: '2025-01-01'
    },
    {
      ...initialVersion,
      label: {
        id: 'initial',
        defaultMessage: 'Initial',
        description: 'Version initial'
      }
    }
  ]
}

const createEventSpy =
  fn<(input: { type: string; configVersionId?: string }) => void>()

function withLegacyRecordsFeatureFlag(enabled: boolean) {
  const features = window.config.FEATURES
  window.config.FEATURES = { ...features, LEGACY_RECORDS: enabled }
  return () => {
    window.config.FEATURES = features
  }
}

const createEventParameters = {
  msw: {
    handlers: {
      createEvent: [
        tRPCMsw.event.create.mutation((input) => {
          createEventSpy(input)
          return generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [{ type: ActionType.CREATE }]
          })
        })
      ]
    }
  }
}

const registrationAgentLoaders = [
  async () => {
    window.localStorage.setItem(
      'opencrvs',
      tokenWithCreateScopeForAllEventTypes
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
]

export const NoVersionChoiceWithoutLegacyRecordsFeatureFlag: Story = {
  parameters: createEventParameters,
  loaders: registrationAgentLoaders,
  beforeEach: () => withLegacyRecordsFeatureFlag(false),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    // The preview's loaders clear the query cache, so the configuration is added once the story renders
    addLocalEventConfig(birthWithTwoVersions)

    await step('Event with two versions shows no version choice', async () => {
      await userEvent.click(await canvas.findByLabelText('Birth'))
      await expect(canvas.queryByText('Form version')).not.toBeInTheDocument()
    })
  }
}

export const PickPastVersionWithLegacyRecordsFeatureFlag: Story = {
  parameters: createEventParameters,
  loaders: registrationAgentLoaders,
  beforeEach: () => {
    createEventSpy.mockClear()
    return withLegacyRecordsFeatureFlag(true)
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    // The preview's loaders clear the query cache, so the configuration is added once the story renders
    addLocalEventConfig(birthWithTwoVersions)

    await step('Versions show oldest first, current one selected', async () => {
      await userEvent.click(await canvas.findByLabelText('Birth'))
      await canvas.findByText('Form version')

      const initial = canvas.getByLabelText('Initial')
      const v2 = canvas.getByLabelText('V2')
      await expect(
        initial.compareDocumentPosition(v2) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      await expect(v2).toBeChecked()
      await expect(initial).not.toBeChecked()
    })

    await step('The record is created under the picked version', async () => {
      await userEvent.click(canvas.getByLabelText('Initial'))
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))

      await waitFor(async () =>
        expect(createEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'birth',
            configVersionId: 'initial'
          })
        )
      )
    })
  }
}

export const NoVersionChoiceForSingleVersion: Story = {
  parameters: createEventParameters,
  loaders: registrationAgentLoaders,
  beforeEach: () => withLegacyRecordsFeatureFlag(true),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    // The preview's loaders clear the query cache, so the configuration is added once the story renders
    addLocalEventConfig(toVersionedEventConfig(birthConfig))

    await step('Event with one version shows no version choice', async () => {
      await userEvent.click(await canvas.findByLabelText('Birth'))
      await expect(canvas.queryByText('Form version')).not.toBeInTheDocument()
    })
  }
}

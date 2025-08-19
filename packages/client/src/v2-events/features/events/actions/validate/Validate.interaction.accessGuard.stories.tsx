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
import { within, expect, waitFor } from '@storybook/test'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData, addLocalEventConfig } from '../../useEvents/api'
import { Review } from './index'

const generator = testDataGenerator()

const meta: Meta<typeof Review> = {
  title: 'Validate/Interaction/AcccessGuard',
  loaders: [
    () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof Review>

const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

export const PreventAccessForCreated: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(createdEventDocument.id, createdEventDocument)
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(
          `Action VALIDATE not available for the event ${createdEventDocument.id} with status CREATED`
        )
      ).toBeInTheDocument()
    })
  }
}

const notifiedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.NOTIFY]
})

export const PreventAccessForNotified: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(notifiedEventDocument.id, notifiedEventDocument)
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: notifiedEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(
          `Action VALIDATE not available for the event ${notifiedEventDocument.id} with status NOTIFIED (flags: incomplete)`
        )
      ).toBeInTheDocument()
    })
  }
}

const validatedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE, ActionType.VALIDATE]
})

export const PreventAccessForValidated: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(validatedEventDocument.id, validatedEventDocument)
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: validatedEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(
          `Action VALIDATE not available for the event ${validatedEventDocument.id} with status VALIDATED`
        )
      ).toBeInTheDocument()
    })
  }
}

const registeredEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ]
})

export const PreventAccessForRegistered: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(registeredEventDocument.id, registeredEventDocument)
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: registeredEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(
          `Action VALIDATE not available for the event ${registeredEventDocument.id} with status REGISTERED (flags: pending-certification)`
        )
      ).toBeInTheDocument()
    })
  }
}

const rejectedValidatedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REJECT
  ]
})

export const AllowAccessForRejectedValidated: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(
      rejectedValidatedEventDocument.id,
      rejectedValidatedEventDocument
    )
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: rejectedValidatedEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(`Member declaration for John Smith`)
      ).toBeInTheDocument()
    })
  }
}

const declaredEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

export const AllowAccessForDeclared: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(declaredEventDocument.id, declaredEventDocument)
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: declaredEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(`Member declaration for John Smith`)
      ).toBeInTheDocument()
    })
  }
}

const rejectedDeclaredEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE, ActionType.REJECT]
})

export const PreventAccessForRejectedDeclared: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(
      rejectedDeclaredEventDocument.id,
      rejectedDeclaredEventDocument
    )
  },
  parameters: {
    // We are testing that errors are thrown.
    test: { dangerouslyIgnoreUnhandledErrors: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: rejectedDeclaredEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByText(
          `Action VALIDATE not available for the event ${rejectedDeclaredEventDocument.id} with status DECLARED (flags: rejected)`
        )
      ).toBeInTheDocument()
    })
  }
}

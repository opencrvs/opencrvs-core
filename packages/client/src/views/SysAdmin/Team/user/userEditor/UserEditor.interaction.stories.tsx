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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect, fn, waitFor } from '@storybook/test'
import { userEvent } from '@storybook/testing-library'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TestUserRole } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { mockOfflineData } from '@client/tests/mock-offline-data'
import { EditUser, ReviewUser, useUserFormState } from './UserEditor'
import { createTemporaryId } from '@client/v2-events/utils'
import * as V1_LEGACY_ROUTES from '@client/navigation/routes'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const mockRoles = [
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] }
]

const generator = testDataGenerator()
const mockUser = generator.user.registrationAgent().v2
const createUserSpy = fn()

const meta: Meta<typeof EditUser> = {
  title: 'SysAdmin/UserEditor/Interaction',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)]
      }
    }
  },
  beforeEach: () => {
    window.config.ADDITIONAL_USER_FIELDS = []
    window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
    mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
    useUserFormState.getState().clear()
  }
}

export default meta

/**
 * Regression test for: hospital offices not appearing as Registration Office options.
 *
 * The registration office field must include both CRVS_OFFICE and HEALTH_FACILITY
 * locations so that hospital clerks can be assigned to a hospital as their office.
 */
export const RegistrationOfficeIncludesHospitals: StoryObj<typeof EditUser> = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.office'
      })
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Registration office dropdown shows both CRVS offices and hospital facilities',
      async () => {
        const input = await canvas.findByRole('combobox')

        await userEvent.type(input, 'Ibombo')

        await expect(
          canvas.findByText('Ibombo District Office')
        ).resolves.toBeInTheDocument()

        await expect(
          canvas.findByText('Ibombo Rural Health Centre')
        ).resolves.toBeInTheDocument()
      }
    )
  }
}

/**
 * Regression test for: invalid phone number not showing a validation error.
 *
 * The user.details page has requireCompletionToContinue: true, so clicking
 * Continue with an invalid phone number must surface the error inline and
 * keep the user on the same page.
 */
export const InvalidPhoneNumberShowsValidationError: StoryObj<typeof EditUser> =
  {
    parameters: {
      chromatic: { disableSnapshot: true },
      reactRouter: {
        router: routesConfig,
        initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
          userId: createTemporaryId(),
          pageId: 'user.details'
        })
      }
    },
    beforeEach: () => {
      // Pre-seed required fields so only the phone validation fires.
      useUserFormState.getState().setUserForm({
        primaryOfficeId: mockUser.primaryOfficeId,
        role: TestUserRole.enum.REGISTRATION_AGENT,
        name: { firstname: 'Test', surname: 'User' },
        email: 'test@opencrvs.org'
      })
    },
    play: async ({ canvasElement, step }) => {
      const canvas = within(canvasElement)

      await step('Type an invalid phone number', async () => {
        const phoneInput = await canvas.findByTestId('text__phoneNumber')
        await userEvent.type(phoneInput, '12345')
      })

      await step('Click Continue to trigger validation', async () => {
        await userEvent.click(await canvas.findByText('Continue'))
      })

      await step('Validation error is shown for the phone field', async () => {
        await waitFor(() =>
          expect(
            canvasElement.querySelector('#phoneNumber_error')
          ).toHaveTextContent('Not a valid mobile number')
        )
      })
    }
  }

/**
 * Regression test for: touched-then-cleared email field submitting "" instead
 * of undefined, which would be rejected by the backend's z.email() validator.
 *
 * The form state is pre-seeded with email: "" (what the Zustand store holds
 * after a user types an address and clears it). USER_NOTIFICATION_DELIVERY_METHOD
 * is set to 'sms' so email is not required and the form submits. Submitting
 * must normalise email to undefined so it is stored as NULL in the database.
 */
export const ClearedEmailNormalisedToUndefined: StoryObj = {
  render: () => <ReviewUser />,
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: createTemporaryId()
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        createUser: [
          tRPCMsw.user.create.mutation((input) => {
            createUserSpy(input)
            return mockUser
          })
        ]
      }
    }
  },
  beforeEach: () => {
    window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'sms'
    mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'sms'
    createUserSpy.mockReset()
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId,
      role: TestUserRole.enum.REGISTRATION_AGENT,
      name: { firstname: 'Test', surname: 'User' },
      phoneNumber: '01712345678',
      email: '' // touched-and-cleared email field — the bug scenario
    })
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Submit the form with a cleared email', async () => {
      const submitButton = await canvas.findByRole('button', {
        name: /create user/i
      })
      await userEvent.click(submitButton)
    })

    await step(
      'email is not sent as empty string — it must be undefined so the DB stores NULL',
      async () => {
        await waitFor(() =>
          expect(createUserSpy).toHaveBeenCalledWith(
            expect.not.objectContaining({ email: '' })
          )
        )
      }
    )
  }
}

/**
 * Regression test for: touched-then-cleared phone field submitting "" instead
 * of undefined, causing a duplicate-key error on the second user creation at
 * the same office.
 *
 * The form state is pre-seeded with phoneNumber: "" (what the Zustand store
 * holds after a user types a number and clears the field). Submitting should
 * normalise this to undefined so mobile is stored as NULL in the database.
 */
export const ClearedPhoneNumberNormalisedToUndefined: StoryObj = {
  render: () => <ReviewUser />,
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: createTemporaryId()
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        createUser: [
          tRPCMsw.user.create.mutation((input) => {
            createUserSpy(input)
            return mockUser
          })
        ]
      }
    }
  },
  beforeEach: () => {
    createUserSpy.mockReset()
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId,
      role: TestUserRole.enum.REGISTRATION_AGENT,
      name: { firstname: 'Test', surname: 'User' },
      phoneNumber: '', // touched-and-cleared phone field — the bug scenario
      email: 'newuser@opencrvs.org'
    })
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Submit the form with a cleared phone number', async () => {
      const submitButton = await canvas.findByRole('button', {
        name: /create user/i
      })
      await userEvent.click(submitButton)
    })

    await step(
      'mobile is not sent as empty string — it must be undefined so the DB stores NULL',
      async () => {
        await waitFor(() =>
          expect(createUserSpy).toHaveBeenCalledWith(
            expect.not.objectContaining({ mobile: '' })
          )
        )
      }
    )
  }
}

const userA = generator.user.registrationAgent().v2
const userB = generator.user.localRegistrar().v2

/**
 * Find the ToggleMenu trigger button in the row containing the given user name.
 */
function findMenuTriggerForUser(
  container: HTMLElement,
  userName: string
): HTMLButtonElement {
  const profileLinks = Array.from(
    container.querySelectorAll<HTMLButtonElement>('#profile-link')
  )
  const nameCell = profileLinks.find(
    (el) => el.textContent?.trim() === userName
  )
  if (!nameCell) throw new Error(`User row not found for: ${userName}`)
  const row = nameCell.closest('tr')
  if (!row) throw new Error(`Table row not found for: ${userName}`)
  const trigger = row.querySelector<HTMLButtonElement>('button[popovertarget]')
  if (!trigger)
    throw new Error(`Menu trigger not found in row for: ${userName}`)
  return trigger
}

/**
 * Regression test for: stale form state from a previously viewed user appearing
 * when navigating to a different user's edit/review page.
 *
 * Scenario: the admin opens Kennedy's profile, edits a field, then cancels back
 * to the user list without submitting. Opening Felix's profile next must show
 * Felix's own data, not Kennedy's leftover form state.
 */
export const CorrectUserDataLoadedAfterSwitchingUsers: StoryObj<
  typeof EditUser
> = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath:
        V1_LEGACY_ROUTES.TEAM_USER_LIST + `?locationId=${userA.primaryOfficeId}`
    },
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [userA, userB]),
          tRPCMsw.user.get.query((id) =>
            id === userB.id ? { ...userB, data: {} } : { ...userA, data: {} }
          )
        ]
      }
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = []
      useUserFormState.getState().clear()
    }
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText(`${userA.name.firstname} ${userA.name.surname}`, {
        selector: '#profile-link'
      })
      await canvas.findByText(`${userB.name.firstname} ${userB.name.surname}`, {
        selector: '#profile-link'
      })
    })

    await step(
      `Open ${userB.name.firstname}'s action menu and click Edit details`,
      async () => {
        const trigger = findMenuTriggerForUser(
          canvasElement,
          `${userB.name.firstname} ${userB.name.surname}`
        )
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover)
          throw new Error(`${userB.name.firstname} menu popover not found`)
        await userEvent.click(within(popover).getByText('Edit details'))
      }
    )

    await step(
      `Verify ${userB.name.firstname}'s review page loaded`,
      async () => {
        await canvas.findByText(
          `${userB.name.firstname} ${userB.name.surname}`,
          { selector: '[data-testid="row-value-name"]', exact: false }
        )
      }
    )

    await step('Click Edit on the email field', async () => {
      await userEvent.click(await canvas.findByTestId('change-button-email'))
    })

    await step('Modify the email field without submitting', async () => {
      const emailInputs = await canvas.findAllByTestId('text__email')
      await userEvent.clear(emailInputs[0])
      await userEvent.type(emailInputs[0], 'modified@example.com')
      await userEvent.click(document.body)
    })

    await step(
      'Cancel — close without submitting, back to user list',
      async () => {
        await userEvent.click(await canvas.findByTestId('crcl-btn'))
      }
    )

    await step(
      `Open ${userA.name.firstname}'s action menu and click Edit details`,
      async () => {
        const trigger = findMenuTriggerForUser(
          canvasElement,
          `${userA.name.firstname} ${userA.name.surname}`
        )
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover)
          throw new Error(`${userA.name.firstname} menu popover not found`)
        await userEvent.click(within(popover).getByText('Edit details'))
      }
    )

    await step(
      `${userA.name.firstname}'s review page shows ${userA.name.firstname}'s data`,
      async () => {
        await expect(
          canvas.findByText(`${userA.name.firstname} ${userA.name.surname}`, {
            selector: '[data-testid="row-value-name"]',
            exact: false
          })
        ).resolves.toBeInTheDocument()
      }
    )
  }
}

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
import {
  TestUserRole,
  TokenUserType,
  User,
  UUID
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { mockOfflineData } from '@client/tests/mock-offline-data'
import { EditUser, ReviewUser, useUserFormState } from './UserEditor'
import { createTemporaryId } from '@client/v2-events/utils'

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

/**
 * Authorization tests for the EditUser flow against the user.edit scope.
 *
 * Hierarchy in V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP:
 *   Central (province, root)
 *     └── Ibombo (district)
 *   Sulaka  (province, separate root)
 *
 * Scope shape (test-data-generators.ts):
 *   - NATIONAL_SYSTEM_ADMIN: user.edit with no jurisdiction filter; allowed
 *     roles include REGISTRATION_AGENT.
 *   - LOCAL_SYSTEM_ADMIN: user.edit with accessLevel: 'administrativeArea'
 *     and an allowed role list that does NOT include NATIONAL_SYSTEM_ADMIN.
 */

const CENTRAL_ADMIN_AREA_ID = 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID
const SULAKA_ADMIN_AREA_ID = 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID
const CENTRAL_PROVINCIAL_OFFICE_ID =
  '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID
const SULAKA_PROVINCIAL_OFFICE_ID =
  '2884f5b9-17b4-49ce-bf4d-f538228935df' as UUID

const TARGET_NSA_USER_ID = 'ac0babf3-282a-447a-aecc-3b9aa9fb7cc5' as UUID
const TARGET_FIELD_AGENT_USER_ID =
  'b7d2c1f4-3a5e-4c8d-9b2e-1f6a8d4e5c7b' as UUID

const targetNationalSystemAdmin = {
  id: TARGET_NSA_USER_ID,
  name: { firstname: 'Target', surname: 'NSA' },
  role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
  primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
  administrativeAreaId: CENTRAL_ADMIN_AREA_ID,
  type: TokenUserType.enum.user,
  status: 'active',
  mobile: '+260921000001',
  email: 'target.nsa@opencrvs.org'
} as unknown as User

const targetFieldAgentInSulaka = {
  id: TARGET_FIELD_AGENT_USER_ID,
  name: { firstname: 'Target', surname: 'FieldAgent' },
  role: TestUserRole.enum.FIELD_AGENT,
  primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID,
  administrativeAreaId: SULAKA_ADMIN_AREA_ID,
  type: TokenUserType.enum.user,
  status: 'active',
  mobile: '+260921000002',
  email: 'target.fa@opencrvs.org'
} as unknown as User

/**
 * Returns the user shape the redux profile fetch should receive for the
 * current user (so we can override admin area / office at story level), and
 * the target user payload for any other id.
 */
function userGetHandler({
  currentUserId,
  currentUser,
  targetUser
}: {
  currentUserId: string
  currentUser: User
  targetUser: User
}) {
  return tRPCMsw.user.get.query((id) => {
    if (id === currentUserId) {
      return currentUser
    }
    return targetUser
  })
}

const localSystemAdminUser = generator.user.localSystemAdmin().v2
const nationalSystemAdminUser = generator.user.nationalSystemAdmin().v2

/**
 * 1) New-user flow is gated by canAddOfficeUsers — the admin must hold a
 *    user.create scope whose jurisdiction (accessLevel) covers the chosen
 *    primaryOffice. NATIONAL_SYSTEM_ADMIN holds user.create without an
 *    accessLevel filter (defaults to 'all'), so any office is permitted and
 *    the form renders.
 */
export const NewUserCreationAllowedInJurisdiction: StoryObj<typeof EditUser> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.details'
      })
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId
    })
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('User details form renders for the new-user flow', async () => {
      await expect(
        canvas.findByTestId('text__phoneNumber')
      ).resolves.toBeInTheDocument()
    })

    await step('No unauthorized toast is shown', async () => {
      expect(
        within(document.body).queryByText(
          'We are unable to display this page to you'
        )
      ).toBeNull()
    })
  }
}

/**
 * 1b) Same gate, denial path: a role without a user.create scope (here,
 *     REGISTRATION_AGENT) cannot create users in any office. The form must
 *     not render and the unauthorized toast must surface.
 *
 *     This also covers the "outside jurisdiction" case structurally:
 *     canAddOfficeUsers returns false whenever no matching scope's
 *     accessLevel covers the chosen office. When tokens with
 *     jurisdiction-restricted user.create scopes (accessLevel: 'location' /
 *     'administrativeArea') are added to test fixtures, additional stories
 *     can mirror this assertion with a target office outside the admin's
 *     hierarchy.
 */
export const NewUserCreationBlockedWithoutJurisdiction: StoryObj<
  typeof EditUser
> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.details'
      })
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId
    })
  },
  play: async ({ step }) => {
    await step(
      'Unauthorized toast appears (no user.create scope grants jurisdiction over the chosen office)',
      async () => {
        await waitFor(() =>
          expect(
            within(document.body).getByText(
              'We are unable to display this page to you'
            )
          ).toBeInTheDocument()
        )
      }
    )

    await step('New-user form is not rendered (redirected)', async () => {
      await waitFor(() =>
        expect(
          document.querySelector('[data-testid="text__phoneNumber"]')
        ).toBeNull()
      )
    })
  }
}

/**
 * 2) NATIONAL_SYSTEM_ADMIN editing a REGISTRATION_AGENT — allowed by the
 *    role list on user.edit. The form renders, no toast.
 */
export const EditUserWithProperAccess: StoryObj<typeof EditUser> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: mockUser.id,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: nationalSystemAdminUser.id,
            currentUser: nationalSystemAdminUser,
            targetUser: mockUser
          })
        ]
      }
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId,
      role: TestUserRole.enum.REGISTRATION_AGENT,
      name: {
        firstname: mockUser.name.firstname,
        surname: mockUser.name.surname
      },
      email: mockUser.email
    })
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('User details form is visible', async () => {
      await expect(
        canvas.findByTestId('text__phoneNumber')
      ).resolves.toBeInTheDocument()
    })

    await step('No unauthorized toast is shown', async () => {
      expect(
        within(document.body).queryByText(
          'We are unable to display this page to you'
        )
      ).toBeNull()
    })
  }
}

/**
 * 3) LOCAL_SYSTEM_ADMIN trying to edit a NATIONAL_SYSTEM_ADMIN — blocked by
 *    the role-restricted user.edit scope. Toast appears and the user is
 *    redirected away from the edit form.
 */
export const EditUserBlockedByRoleRestriction: StoryObj<typeof EditUser> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: TARGET_NSA_USER_ID,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: localSystemAdminUser.id,
            // Pin the admin's jurisdiction to Central so the admin-area check
            // passes; only the role check should fail in this story.
            currentUser: {
              ...localSystemAdminUser,
              primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
              administrativeAreaId: CENTRAL_ADMIN_AREA_ID
            } as unknown as User,
            targetUser: targetNationalSystemAdmin
          })
        ]
      }
    }
  },
  play: async ({ step }) => {
    await step(
      'Unauthorized toast appears (target role is not in the user.edit role list)',
      async () => {
        await waitFor(() =>
          expect(
            within(document.body).getByText(
              'We are unable to display this page to you'
            )
          ).toBeInTheDocument()
        )
      }
    )

    await step('Edit form is no longer rendered (redirected)', async () => {
      await waitFor(() =>
        expect(
          document.querySelector('[data-testid="text__phoneNumber"]')
        ).toBeNull()
      )
    })
  }
}

/**
 * 4) LOCAL_SYSTEM_ADMIN whose jurisdiction is Central trying to edit a
 *    FIELD_AGENT under Sulaka (separate root). Role is allowed, but the
 *    administrative-area check fails. Toast appears, user is redirected.
 */
export const EditUserBlockedByAdministrativeAreaMismatch: StoryObj<
  typeof EditUser
> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: TARGET_FIELD_AGENT_USER_ID,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: localSystemAdminUser.id,
            currentUser: {
              ...localSystemAdminUser,
              primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
              administrativeAreaId: CENTRAL_ADMIN_AREA_ID
            } as unknown as User,
            targetUser: targetFieldAgentInSulaka
          })
        ]
      }
    }
  },
  play: async ({ step }) => {
    await step(
      "Unauthorized toast appears (target sits outside the admin's jurisdiction)",
      async () => {
        await waitFor(() =>
          expect(
            within(document.body).getByText(
              'We are unable to display this page to you'
            )
          ).toBeInTheDocument()
        )
      }
    )

    await step('Edit form is no longer rendered (redirected)', async () => {
      await waitFor(() =>
        expect(
          document.querySelector('[data-testid="text__phoneNumber"]')
        ).toBeNull()
      )
    })
  }
}

/**
 * Authorization tests for the ReviewUser flow.
 *
 * Same canEditUser gate as EditUser — opening the review page for an
 * existing user the current user cannot edit must surface an unauthorized
 * toast and redirect away (replace).
 */

export const ReviewUserWithProperAccess: StoryObj<typeof ReviewUser> = {
  render: () => <ReviewUser />,
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: mockUser.id
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: nationalSystemAdminUser.id,
            currentUser: nationalSystemAdminUser,
            targetUser: mockUser
          })
        ]
      }
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: mockUser.primaryOfficeId,
      role: TestUserRole.enum.REGISTRATION_AGENT,
      name: {
        firstname: mockUser.name.firstname,
        surname: mockUser.name.surname
      },
      email: mockUser.email
    })
  },
  play: async ({ step }) => {
    await step(
      'Review page renders the confirm submit button (target editable)',
      async () => {
        await waitFor(() =>
          expect(
            document.querySelector('#submit-edit-user-form')
          ).not.toBeNull()
        )
      }
    )

    await step('No unauthorized toast is shown', async () => {
      expect(
        within(document.body).queryByText(
          'We are unable to display this page to you'
        )
      ).toBeNull()
    })
  }
}

export const ReviewUserBlockedByRoleRestriction: StoryObj<typeof ReviewUser> = {
  render: () => <ReviewUser />,
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: TARGET_NSA_USER_ID
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: localSystemAdminUser.id,
            currentUser: {
              ...localSystemAdminUser,
              primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
              administrativeAreaId: CENTRAL_ADMIN_AREA_ID
            } as unknown as User,
            targetUser: targetNationalSystemAdmin
          })
        ]
      }
    }
  },
  play: async ({ step }) => {
    await step(
      'Unauthorized toast appears (target role outside the user.edit role list)',
      async () => {
        await waitFor(() =>
          expect(
            within(document.body).getByText(
              'We are unable to display this page to you'
            )
          ).toBeInTheDocument()
        )
      }
    )

    await step('Review submit button is gone (redirected)', async () => {
      await waitFor(() =>
        expect(document.querySelector('#submit-edit-user-form')).toBeNull()
      )
    })
  }
}

export const ReviewUserBlockedByAdministrativeAreaMismatch: StoryObj<
  typeof ReviewUser
> = {
  render: () => <ReviewUser />,
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: TARGET_FIELD_AGENT_USER_ID
      })
    },
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [
          userGetHandler({
            currentUserId: localSystemAdminUser.id,
            currentUser: {
              ...localSystemAdminUser,
              primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
              administrativeAreaId: CENTRAL_ADMIN_AREA_ID
            } as unknown as User,
            targetUser: targetFieldAgentInSulaka
          })
        ]
      }
    }
  },
  play: async ({ step }) => {
    await step(
      "Unauthorized toast appears (target sits outside the admin's jurisdiction)",
      async () => {
        await waitFor(() =>
          expect(
            within(document.body).getByText(
              'We are unable to display this page to you'
            )
          ).toBeInTheDocument()
        )
      }
    )

    await step('Review submit button is gone (redirected)', async () => {
      await waitFor(() =>
        expect(document.querySelector('#submit-edit-user-form')).toBeNull()
      )
    })
  }
}

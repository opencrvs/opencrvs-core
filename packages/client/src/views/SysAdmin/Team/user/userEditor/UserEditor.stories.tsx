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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { FieldType, TestUserRole } from '@opencrvs/commons/client'
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

const generator = testDataGenerator()
const existingUser = generator.user.registrationAgent().v2

const mockRoles = [
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] }
]

const additionalFields = [
  {
    id: 'staffId',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Staff ID',
      description: 'Staff ID label',
      id: 'userForm.additionalField.staffId'
    }
  }
] as const

const meta: Meta<typeof ReviewUser> = {
  title: 'SysAdmin/UserEditor',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          // Fallback handler — prevents 404s from stale queries when switching stories
          tRPCMsw.user.get.query(() => ({ ...existingUser, data: {} }))
        ]
      }
    }
  }
}

export default meta

/**
 * user.details form when the country uses email as the notification delivery
 * method. The email field must be marked required; phone must be optional.
 */
export const UserDetailsEmailDelivery: StoryObj = {
  render: () => <EditUser />,
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.details'
      })
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = []
      // Needed for the first render — getUserEditConfig reads window.config
      // synchronously before the /api/config fetch settles.
      window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      // story-level MSW handlers don't reliably override the global /api/config
      // handler (named-group vs flat-array registration in preview.tsx), so we
      // mutate the source object that the global handler returns directly. Each
      // story that changes this value must also reset it (see below) to avoid
      // polluting subsequent stories.
      mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      // Pre-seed primaryOfficeId so user.office (requireCompletionToContinue)
      // is satisfied and the router lands on user.details.
      useUserFormState.getState().setUserForm({
        primaryOfficeId: existingUser.primaryOfficeId
      })
    }
  ]
}

/**
 * user.details form when the country uses SMS as the notification delivery
 * method. The phone field must be marked required; email must be optional.
 */
export const UserDetailsSmsDelivery: StoryObj = {
  render: () => <EditUser />,
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.details'
      })
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = []
      // See UserDetailsEmailDelivery for why both window.config and
      // mockOfflineData.config must be set.
      window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'sms'
      mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'sms'
      useUserFormState.getState().setUserForm({
        primaryOfficeId: existingUser.primaryOfficeId
      })
    }
  ]
}

/**
 * Review page for a new user with no fields filled in.
 * The additional Staff ID field is visible but empty.
 */
export const ReviewWithEmptyFields: StoryObj<typeof ReviewUser> = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: createTemporaryId()
      })
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = [...additionalFields]
      // Reset to the default — guards against UserDetailsSmsDelivery running
      // first and leaving 'sms' in the shared mockOfflineData object.
      window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      useUserFormState.getState().clear()
    }
  ]
}

/**
 * Review page for an existing user with all fields filled, including the
 * additional Staff ID field. The store is pre-seeded so the review renders
 * the staffId value immediately without relying on the async user.get effect.
 */
export const ReviewWithAllFieldsFilled: StoryObj<typeof ReviewUser> = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
        userId: existingUser.id
      })
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = [...additionalFields]
      // Reset to the default — guards against UserDetailsSmsDelivery running
      // first and leaving 'sms' in the shared mockOfflineData object.
      window.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      mockOfflineData.config.USER_NOTIFICATION_DELIVERY_METHOD = 'email'
      // Pre-seed the store directly. When the component mounts,
      // the useEffect sees a non-empty store and skips auto-populate,
      // preserving the staffId value we set here.
      useUserFormState.getState().setUserForm({
        primaryOfficeId: existingUser.primaryOfficeId,
        role: TestUserRole.enum.REGISTRATION_AGENT,
        name: {
          firstname: existingUser.name[0].given[0],
          surname: existingUser.name[0].family,
          middlename: ''
        },
        phoneNumber: '01233443443',
        email: existingUser.email,
        fullHonorificName: 'Dr. Felix Katongo',
        device: 'iPhone 15',
        'user.staffId': 'EMP-12345'
      })
    }
  ]
}

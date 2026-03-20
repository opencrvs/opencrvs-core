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

import { defineMessages, IntlShape } from 'react-intl'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@client/v2-events/trpc'

// This will be used in user creation form
/** @knipignore */
export function useRoles() {
  const trpc = useTRPC()
  return {
    listRoles: {
      useQuery: (options?: { enabled?: boolean }) => {
        return useQuery(trpc.user.roles.list.queryOptions())
      },
      useSuspenseQuery: () => {
        return [useSuspenseQuery(trpc.user.roles.list.queryOptions()).data]
      }
    }
  }
}

const messages = defineMessages({
  role: {
    id: 'event.history.role',
    defaultMessage:
      '{role, select, LOCAL_REGISTRAR {Local Registrar} HOSPITAL_CLERK {Hospital Clerk} FIELD_AGENT {Field Agent} POLICE_OFFICER {Police Officer} REGISTRATION_AGENT {Registration Agent} HEALTHCARE_WORKER {Healthcare Worker} COMMUNITY_LEADER {Community Leader} LOCAL_SYSTEM_ADMIN {Administrator} NATIONAL_REGISTRAR {Registrar General} PERFORMANCE_MANAGER {Operations Manager} NATIONAL_SYSTEM_ADMIN {National Administrator} other {Unknown}}',
    description: 'Role of the user in the event history'
  }
})

export function formatUserRole(role: string | undefined, intl: IntlShape) {
  return intl.formatMessage(messages.role, {
    role: role ?? ''
  })
}

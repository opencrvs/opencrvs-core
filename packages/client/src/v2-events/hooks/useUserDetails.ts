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

import { useIntl, defineMessages } from 'react-intl'
import { useSelector } from 'react-redux'
import { personNameFromV1ToV2 } from '@opencrvs/commons/client'
import { ActionType, TokenUserType } from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { getUsersFullName } from '@client/v2-events/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { DECLARATION_ACTION_UPDATE } from '../features/events/actions/correct/useActionForHistory'

const messages = defineMessages({
  systemDefaultName: {
    id: 'event.history.systemDefaultName',
    defaultMessage: 'System integration',
    description: 'Fallback for system integration name in the event history'
  },
  system: {
    id: 'event.history.system',
    defaultMessage: 'System',
    description: 'Name for system initiated actions in the event history'
  },
  role: {
    id: 'event.history.role',
    defaultMessage:
      '{role, select, LOCAL_REGISTRAR {Local Registrar} HOSPITAL_CLERK {Hospital Clerk} FIELD_AGENT {Field Agent} POLICE_OFFICER {Police Officer} REGISTRATION_AGENT {Registration Agent} HEALTHCARE_WORKER {Healthcare Worker} COMMUNITY_LEADER {Community Leader} LOCAL_SYSTEM_ADMIN {Administrator} NATIONAL_REGISTRAR {Registrar General} PERFORMANCE_MANAGER {Operations Manager} NATIONAL_SYSTEM_ADMIN {National Administrator} HEALTH {Health integration} IMPORT_EXPORT {Import integration} CITIZEN_PORTAL {Citizen Portal} NATIONAL_ID {National ID integration} RECORD_SEARCH {Record search integration} other {Unknown}}',
    description: 'Role of the user in the event history'
  }
})

export function useUserDetails() {
  const intl = useIntl()
  const { getUser } = useUsers()
  const users = getUser.getAllCached()
  const { systems } = useSelector(getOfflineData)

  const getUserDetails = ({
    createdByUserType,
    createdBy,
    type,
    createdByRole
  }: {
    createdByUserType: TokenUserType
    createdBy: string
    type: ActionType | DECLARATION_ACTION_UPDATE
    createdByRole?: string
  }): {
    type: 'user' | 'system' | 'integration'
    name: string
    role: string | undefined
  } => {

    if (createdByUserType === 'system') {
      const system = systems.find((s) => s._id === createdBy)
      return {
        type: 'integration',
        name: system?.name ?? intl.formatMessage(messages.systemDefaultName),
        role: undefined
      } as const
    }

    const role = intl.formatMessage(messages.role, {
      role: createdByRole || ''
    })

    if (type === ActionType.DUPLICATE_DETECTED) {
      return {
        type: 'system',
        name: intl.formatMessage(messages.system),
        role
      } as const
    }

    const user = users.find((u) => u.id === createdBy)
    const splitNames = user?.name
      ? personNameFromV1ToV2(user.name)
      : {
          firstname: '',
          middlename: '',
          surname: ''
        }

    return {
      type: 'user',
      name: user ? getUsersFullName(user.name, intl.locale) : 'Missing user',
      role,
      ...splitNames
    } as const
  }

  return { getUserDetails }
}

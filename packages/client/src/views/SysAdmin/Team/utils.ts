/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  IFormField,
  IFormSectionData,
  ISelectFormFieldWithDynamicOptions,
  ISelectFormFieldWithOptions
} from '@client/forms'
import { roleQueries } from '@client/forms/user/query/queries'
import { userMessages } from '@client/i18n/messages'
import {
  SYS_ADMIN_ROLES,
  NATL_ADMIN_ROLES,
  NATIONAL_REGISTRAR_ROLES
} from '@client/utils/constants'
import { GQLRole } from '@opencrvs/gateway/src/graphql/schema'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { messages } from '@client/i18n/messages/views/userSetup'
import { IStoreState } from '@client/store'
import { getUserDetails } from '@client/profile/profileSelectors'
import { Roles } from '@client/utils/authUtils'

export enum UserStatus {
  ACTIVE,
  DEACTIVATED,
  PENDING,
  DISABLED
}

export const transformRoleDataToDefinitions = (
  fields: IFormField[],
  data: any,
  userFormData: IFormSectionData
): IFormField[] => {
  const roles = data as Array<any>
  const transformTypes = (types: string[]) =>
    types.map((type) => ({
      label: userMessages[type],
      value: type
    }))

  return fields.map((field) => {
    if (field.name === 'role') {
      if (userFormData && userFormData.role) {
        userFormData.role = ''
      }
      ;(field as ISelectFormFieldWithOptions).options = roles.map(
        ({ value }: { value: string }) => ({
          label: userMessages[value],
          value
        })
      )
      return field
    } else if (field.name === 'type') {
      if (userFormData && userFormData.type) {
        userFormData.type = ''
      }
      ;(field as ISelectFormFieldWithDynamicOptions).dynamicOptions.options =
        roles.reduce(
          (options, { value, types }) => ({
            ...options,
            [value]: transformTypes(types)
          }),
          {}
        )
      return field
    } else return field
  })
}

function getRoleSearchCriteria(currentUserRole?: string) {
  if (currentUserRole && SYS_ADMIN_ROLES.includes(currentUserRole)) {
    return {
      value: { nin: NATL_ADMIN_ROLES.concat(NATIONAL_REGISTRAR_ROLES) }
    }
  }
  return {}
}

export async function alterRolesBasedOnUserRole(
  primaryOfficeId: string,
  getState: () => IStoreState
) {
  const userDetails = getUserDetails(getState())
  const roleSearchCriteria = getRoleSearchCriteria(userDetails?.role)
  const roleData = await roleQueries.fetchRoles(roleSearchCriteria)
  const roles = roleData.data.getRoles as Array<GQLRole>

  // This is a legacy function that allows you to filter available roles
  // It was used if some countries want to customise role types such as MAYOR
  // There was a legacy bug raised that there should be only one MAYOR per location
  // But that is implementation specific for Bangladesh
  // Leaving this function here in case in the future we wish to add config UI to manage something like that.
  // removing for now because of this requirement that types should only be available for field agents with no control
  // over how many of each user type can be created
  // https://github.com/opencrvs/opencrvs-core/issues/2849

  /*

  const userData = await userQueries.searchUsers(primaryOfficeId)
  const users = userData.data.searchUsers.results as Array<GQLUser>
  const hasSecretary = users.some((user) => user.type === ROLE_TYPE_SECRETARY)
  const hasMayor = users.some((user) => user.type === ROLE_TYPE_MAYOR)
  const hasChariman = users.some((user) => user.type === ROLE_TYPE_CHAIRMAN)*/

  const roleList = [] as Array<GQLRole>

  /* eslint-disable array-callback-return */
  roles.map((role) => {
    roleList.push(role)
    // Leaving this logic here in case in the future we wish to add config UI to manage functionality restricting user roles.

    /*if (
      role.value === ROLE_FIELD_AGENT ||
      role.value === ROLE_REGISTRATION_AGENT
    ) {
      if (hasSecretary && (hasChariman || hasMayor)) {
        roleList.push(role)
      }
    } else if (role.value === ROLE_LOCAL_REGISTRAR) {
      role.types =
        (role.types &&
          role.types.filter(
            (t: string | null) =>
              (t === ROLE_TYPE_SECRETARY && !hasSecretary) ||
              (t === ROLE_TYPE_MAYOR && !hasMayor) ||
              (t === ROLE_TYPE_CHAIRMAN && !hasChariman)
          )) ||
        []
      role.types.length > 0 && roleList.push(role)
    } else {
    }*/
  })

  /* eslint-enable array-callback-return */
  return roleList
}

const AuditDescriptionMapping: {
  [key: string]: MessageDescriptor
} = {
  IN_PROGRESS: messages.inProgressAuditAction,
  DECLARED: messages.declaredAuditAction,
  VALIDATED: messages.validatedAuditAction,
  DECLARATION_UPDATED: messages.updatedAuditAction,
  REGISTERED: messages.registeredAuditAction,
  REJECTED: messages.rejectedAuditAction,
  CERTIFIED: messages.certifiedAuditAction,
  ASSIGNED: messages.assignedAuditAction,
  UNASSIGNED: messages.unAssignedAuditAction,
  CORRECTED: messages.correctedAuditAction,
  ARCHIVED: messages.archivedAuditAction,
  LOGGED_IN: messages.loggedInAuditAction,
  LOGGED_OUT: messages.loggedOutAuditAction,
  PHONE_NUMBER_CHANGED: messages.phoneNumberChangedAuditAction,
  PASSWORD_CHANGED: messages.passwordChangedAuditAction,
  DEACTIVATE: messages.deactivateAuditAction,
  REACTIVATE: messages.reactivateAuditAction,
  EDIT_USER: messages.editUserAuditAction,
  CREATE_USER: messages.createUserAuditAction,
  PASSWORD_RESET: messages.passwordResetAuditAction,
  USERNAME_REMINDER: messages.userNameReminderAuditAction,
  USERNAME_REMINDER_BY_ADMIN: messages.usernameReminderByAdmin,
  PASSWORD_RESET_BY_ADMIN: messages.passwordResetByAdmin,
  RETRIEVED: messages.retrievedAuditAction,
  VIEWED: messages.viewedAuditAction,
  REINSTATED_IN_PROGRESS: messages.reInstatedInProgressAuditAction,
  REINSTATED_DECLARED: messages.reInstatedInReviewAuditAction,
  REINSTATED_REJECTED: messages.reInStatedRejectedAuditAction,
  SENT_FOR_APPROVAL: messages.sentForApprovalAuditAction
}

export function getUserAuditDescription(
  status: string
): MessageDescriptor | undefined {
  return AuditDescriptionMapping[status] || undefined
}
export function checkExternalValidationStatus(status?: string | null): boolean {
  return !(
    !window.config.EXTERNAL_VALIDATION_WORKQUEUE &&
    status === 'WAITING_VALIDATION'
  )
}
export function checkIfLocalLanguageProvided() {
  return window.config.LANGUAGES.split(',').length > 1
}

export function getUserRole(
  user: { role?: string | null },
  intl: IntlShape
): string | undefined {
  switch (user.role) {
    case Roles.FIELD_AGENT:
      return intl.formatMessage(userMessages.FIELD_AGENT)
    case Roles.REGISTRATION_AGENT:
      return intl.formatMessage(userMessages.REGISTRATION_AGENT)
    case Roles.NATIONAL_REGISTRAR:
      return intl.formatMessage(userMessages.NATIONAL_REGISTRAR)
    case Roles.LOCAL_REGISTRAR:
      return intl.formatMessage(userMessages.LOCAL_REGISTRAR)
    case Roles.LOCAL_SYSTEM_ADMIN:
      return intl.formatMessage(userMessages.LOCAL_SYSTEM_ADMIN)
    case Roles.NATIONAL_SYSTEM_ADMIN:
      return intl.formatMessage(userMessages.NATIONAL_SYSTEM_ADMIN)
    case Roles.PERFORMANCE_MANAGEMENT:
      return intl.formatMessage(userMessages.PERFORMANCE_MANAGEMENT)
    default:
      return undefined
  }
}

export function getUserType(
  user: { type?: string | null },
  intl: IntlShape
): string | undefined {
  if (user.type) {
    return intl.formatMessage(userMessages[user.type as string])
  } else {
    return undefined
  }
}

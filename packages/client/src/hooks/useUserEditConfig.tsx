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
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  alwaysTrue,
  defineConditional,
  EncodedScope,
  EventConfig,
  field,
  FieldConfig,
  FieldType,
  getAcceptedScopesByType,
  getAvailableRolesForUserUpdatePayload,
  hasScope,
  never,
  or,
  PageTypes,
  UserContext,
  UserScopeV2,
  UUID
} from '@opencrvs/commons/client'
import { messages } from '@client/i18n/messages/views/userForm'
import { useRoles, formatUserRole } from '@client/v2-events/hooks/useRoles'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { emptyMessage, isTemporaryId } from '@client/v2-events/utils'
import { ROUTES } from '@client/v2-events/routes/routes'
import { validationMessages } from '@client/i18n/messages'

export function useUserEditConfig(
  locationId: UUID | undefined,
  selectedRole?: { scopes: EncodedScope[] },
  additionalFields: FieldConfig[] = []
) {
  const intl = useIntl()
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()

  const { getLocationHierarchy } = useLocations()
  const { userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.EDIT)

  const currentUser = useSelector(getUserDetails)
  const userScopes = useSelector(getScope) || []

  if (!currentUser) {
    throw new Error('User not found')
  }

  const locationHierarchy = getLocationHierarchy.useQuery(locationId as UUID, {
    enabled: !!locationId
  })

  const isNewUser = isTemporaryId(userId)

  const acceptedScopes = getAcceptedScopesByType({
    acceptedScopes: [isNewUser ? 'user.create' : 'user.edit'],
    scopes: userScopes
  }) as UserScopeV2[] // @Todo: Remove this type assertion

  const availabelRoles = getAvailableRolesForUserUpdatePayload({
    allRoles: roles.map((role) => role.id),
    userRequesting: {
      id: currentUser.id,
      primaryOfficeId: currentUser.primaryOfficeId,
      administrativeAreaId: currentUser.administrativeAreaId,
      role: currentUser.role,
      signature: currentUser.signature,
      type: currentUser.type
    } satisfies UserContext,
    acceptedScopes,
    userLocation: {
      primaryOfficeId: locationId,
      administrativeHierarchy: locationHierarchy ?? []
    }
  })

  const roleOptions = availabelRoles.map((role) => ({
    value: role,
    label: formatUserRole(role, intl)
  }))
  return {
    getConfig: () =>
      ({
        id: '__user__',
        analytics: false,
        summary: {
          fields: []
        },
        advancedSearch: [],
        flags: [],
        title: emptyMessage,
        label: emptyMessage,
        declaration: {
          label: emptyMessage,
          pages: [
            {
              id: 'user.office',
              title: messages.registrationOffice,
              type: PageTypes.enum.FORM,
              requireCompletionToContinue: true,
              fields: [
                {
                  id: 'primaryOfficeId',
                  type: FieldType.LOCATION,
                  required: true,
                  label: messages.registrationOffice
                }
              ]
            },
            {
              id: 'user.details',
              title: messages.userDetails,
              type: PageTypes.enum.FORM,
              requireCompletionToContinue: true,
              fields: [
                {
                  id: 'name',
                  type: FieldType.NAME,
                  required: true,
                  hideLabel: true,
                  label: messages.fullName
                },
                {
                  id: 'phoneNumber',
                  type: FieldType.PHONE,
                  required:
                    window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms',
                  label: messages.phoneNumber,
                  validation: [
                    {
                      message: validationMessages.phoneNumberNotValid,
                      validator: or(
                        field('phoneNumber').matches(
                          String(window.config.PHONE_NUMBER_PATTERN)
                        ),
                        field('phoneNumber').isFalsy()
                      )
                    }
                  ]
                },
                {
                  id: 'email',
                  type: FieldType.EMAIL,
                  required:
                    window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'email',
                  label: messages.email
                },
                {
                  id: 'fullHonorificName',
                  type: FieldType.TEXT,
                  required: false,
                  label: messages.fullHonorificName
                },
                {
                  id: 'divider',
                  type: FieldType.DIVIDER,
                  label: emptyMessage
                },
                {
                  id: 'role',
                  type: FieldType.SELECT,
                  required: true,
                  label: messages.labelRole,
                  options: roleOptions
                },
                {
                  id: 'device',
                  type: FieldType.TEXT,
                  required: false,
                  label: messages.userDevice
                },
                ...additionalFields
              ]
            },
            {
              id: 'user.signature',
              title: messages.userSignatureAttachmentTitle,
              requireCompletionToContinue: true,
              type: PageTypes.enum.FORM,
              conditional: hasScope(
                selectedRole?.scopes ?? [],
                'profile.electronic-signature'
              )
                ? defineConditional(alwaysTrue())
                : never(),
              fields: [
                {
                  id: 'signature',
                  type: FieldType.SIGNATURE,
                  required: false,
                  label: messages.userSignatureAttachment,
                  signaturePromptLabel: messages.userSignatureAttachment,
                  configuration: {
                    maxFileSize: 123456
                  }
                }
              ]
            }
          ]
        },
        actions: []
      }) satisfies EventConfig
  }
}

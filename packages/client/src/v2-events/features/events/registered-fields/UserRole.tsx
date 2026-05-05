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
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  getAcceptedScopesByType,
  getAvailableRolesForUserUpdatePayload,
  UserContext,
  UserRoleField,
  UserScopeV2,
  UUID
} from '@opencrvs/commons/client'
import { useRoles, formatUserRole } from '@client/v2-events/hooks/useRoles'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useUserFormState } from '@client/views/SysAdmin/Team/user/userEditor/UserEditor'
import { isTemporaryId } from '@client/v2-events/utils'
import { ROUTES } from '@client/v2-events/routes'
import { StringifierContext } from './RegisteredField'
import { Select, SelectInputProps } from './Select'

function UserRoleInputWithLocation({
  locationId,
  ...props
}: Omit<SelectInputProps, 'options'> & { locationId: UUID }) {
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

  const locationHierarchy = getLocationHierarchy.useSuspenseQuery(locationId)

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
      administrativeHierarchy: locationHierarchy
    }
  })

  const options = availabelRoles.map((role) => ({
    value: role,
    label: formatUserRole(role, intl)
  }))

  return <Select.Input {...props} options={options} />
}

// Outer shell: guards against a transiently absent primaryOfficeId (e.g.
// during an auth-gate redirect where the form store is cleared before
// navigation completes)
function UserRoleInput(props: Omit<SelectInputProps, 'options'>) {
  const userForm = useUserFormState((s) => s.userForm)
  const subjectLocation = UUID.safeParse(userForm?.primaryOfficeId)

  if (!subjectLocation.success) {
    return <Select.Input {...props} options={[]} />
  }

  return (
    <UserRoleInputWithLocation {...props} locationId={subjectLocation.data} />
  )
}

function UserRoleOutput({ value }: { value: string | undefined }) {
  const intl = useIntl()
  return formatUserRole(value, intl)
}

function stringify(
  value: string,
  context: StringifierContext<UserRoleField>
): string {
  return formatUserRole(value, context.intl)
}

export const UserRole = {
  Input: withSuspense(UserRoleInput),
  Output: UserRoleOutput,
  stringify
}

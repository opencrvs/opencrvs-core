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
import {
  FieldPropsWithoutReferenceValue,
  UserRoleField
} from '@opencrvs/commons/client'
import { useRoles, formatUserRole } from '@client/v2-events/hooks/useRoles'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { Select } from './Select'
import { StringifierContext } from './RegisteredField'

function UserRoleInput({
  onChange,
  value,
  ...props
}: Omit<FieldPropsWithoutReferenceValue<'USER_ROLE'>, 'label'> & {
  onChange: (newValue: string) => void
  value?: string
  label?: FieldPropsWithoutReferenceValue<'USER_ROLE'>['label']
  disabled?: boolean
}) {
  const intl = useIntl()
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()

  const options = roles.map((role) => ({
    value: role.id,
    label: formatUserRole(role.id, intl)
  }))

  return (
    <Select.Input
      {...props}
      data-testid={`user-role__${props.id}`}
      options={options}
      type="SELECT"
      value={value}
      onChange={onChange}
    />
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

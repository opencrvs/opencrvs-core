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
import styled from 'styled-components'
import { ResolvedUser } from '@opencrvs/commons/client'
import { Avatar, Maybe } from '@client/utils/gateway'
import { AvatarSmall } from '@client/components/Avatar'
import { getUsersFullName } from '@client/v2-events/utils'

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

/**
 * @prop names - Name of the user. Can be a plain string or a localisation specific name object
 * @returns Avatar with full name of the user.
 */
export function UserAvatar({
  names,
  avatar,
  locale
}: {
  names: ResolvedUser['name'] | string
  avatar?: Maybe<Avatar>
  locale: string
}) {
  const name =
    typeof names === 'string' ? names : getUsersFullName(names, locale)

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={name} />
      <span>{name}</span>
    </NameAvatar>
  )
}

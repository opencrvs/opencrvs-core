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
import * as React from 'react'
import { AvatarSmall as DefaultAvatar } from '@opencrvs/components/lib/icons'
import { AVATAR_API } from '@client/utils/constants'
import { Avatar } from '@client/utils/gateway'
import styled from '@client/styledComponents'

interface IProps extends React.HTMLAttributes<Element> {
  name?: string
  avatar?: Avatar | undefined | null
}

const AvatarImage = styled.img`
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
  &:focus:visible {
    outline: none;
    box-shadow: 0 0px 0px 2px ${({ theme }) => theme.colors.yellow} inset;
`

export function AvatarSmall({ name, avatar, ...props }: IProps) {
  const [error, setError] = React.useState<boolean>(false)

  if (!error && (name || avatar)) {
    return (
      <AvatarImage
        width={36}
        height={36}
        src={
          avatar
            ? avatar.data
            : `${AVATAR_API}${encodeURIComponent(name!).replace(/%20/g, '+')}`
        }
        onError={() => setError(true)}
        {...props}
      />
    )
  }
  return <DefaultAvatar {...props} />
}

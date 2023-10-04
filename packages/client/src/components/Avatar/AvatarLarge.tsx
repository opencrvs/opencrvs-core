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
import * as React from 'react'
import { AvatarLarge as DefaultAvatar } from '@opencrvs/components/lib/icons'
import { AVATAR_API } from '@client/utils/constants'
import { Avatar } from '@client/utils/gateway'
import styled from 'styled-components'

interface IProps extends React.HTMLAttributes<Element> {
  name?: string
  avatar?: Avatar | undefined | null
}

const AvatarImage = styled.img`
  border-radius: 50%;
  &.clickable {
    cursor: pointer;
  }
`

export function AvatarLarge({ name, avatar, ...props }: IProps) {
  const [error, setError] = React.useState<boolean>(false)

  if (!error && (name || avatar)) {
    return (
      <AvatarImage
        width={104}
        height={104}
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

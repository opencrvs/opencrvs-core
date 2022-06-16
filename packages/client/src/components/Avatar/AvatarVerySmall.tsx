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
import styled from '@client/styledComponents'
import { IAvatar } from '@client/utils/userUtils'
import { AVATAR_API } from '@client/utils/constants'
import { AvatarSmall } from '@opencrvs/components/lib/icons'

interface IProps extends React.HTMLAttributes<HTMLImageElement> {
  name?: string
  avatar?: IAvatar | undefined
}

const AvatarImage = styled.img`
  border-radius: 50%;
  border: solid 2px transparent;
`

const DefaultAvatar = styled(AvatarSmall)`
  transform: scale(0.7);
  overflow: visible;
`
export function AvatarVerySmall({ name, avatar, ...otherProps }: IProps) {
  const [error, setError] = React.useState<boolean>(false)

  if (!error && (name || avatar)) {
    return (
      <AvatarImage
        width={28}
        height={28}
        src={
          avatar
            ? avatar.data
            : `${AVATAR_API}${encodeURIComponent(name!).replace(/%20/g, '+')}`
        }
        onError={() => setError(true)}
        {...otherProps}
      />
    )
  }

  return <DefaultAvatar />
}

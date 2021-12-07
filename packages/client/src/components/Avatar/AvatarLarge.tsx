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
import { AvatarLarge as DefaultAvatar } from '@opencrvs/components/lib/icons'
import { AVATAR_API } from '@client/utils/constants'
import { IAvatar } from '@client/utils/userUtils'
import styled from '@client/styledComponents'

interface IProps extends React.HTMLAttributes<Element> {
  name?: string
  avatar?: IAvatar
}

const AvatarImage = styled.img`
  border-radius: 50%;
`

export function AvatarLarge({ name, avatar, ...props }: IProps) {
  const [error, setError] = React.useState<boolean>(false)

  if (!error && (name || avatar)) {
    return (
      <AvatarImage
        width={132}
        height={132}
        src={
          avatar ? avatar.data : `${AVATAR_API}${name!.replaceAll(' ', '+')}`
        }
        onError={() => setError(true)}
        {...props}
      />
    )
  }
  return <DefaultAvatar {...props} />
}

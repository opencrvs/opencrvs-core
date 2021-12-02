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

interface IProps extends React.HTMLAttributes<Element> {
  name?: string
}

export function AvatarSmall(props: IProps) {
  const [error, setError] = React.useState<boolean>(false)

  if (!error && props.name) {
    return (
      <img
        width={40}
        height={40}
        src={`${AVATAR_API}${props.name.replaceAll(' ', '+')}`}
        onError={() => setError(true)}
        {...props}
      />
    )
  }
  return <DefaultAvatar {...props} />
}

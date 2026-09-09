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
import {
  Avatar as AvatarComponent,
  AvatarProps
} from '@opencrvs/components/lib/Avatar'
import { DocumentPath } from '@opencrvs/commons/client'
import { toFileUrl } from '@client/v2-events/cache'

type Props = Omit<AvatarProps, 'src'> & { src?: DocumentPath | null }

/** `<Avatar>` takes a URL; a user's avatar is stored as a document path. */
export function Avatar({ src, ...props }: Props) {
  return <AvatarComponent {...props} src={src ? toFileUrl(src) : undefined} />
}

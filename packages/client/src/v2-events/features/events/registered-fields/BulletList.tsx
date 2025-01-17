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
import { MessageDescriptor, useIntl } from 'react-intl'
import { BulletList as BulletListComponent } from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons'

export function BulletList({ id, items, font }: FieldProps<'BULLET_LIST'>) {
  const intl = useIntl()
  const formattedItmes = items.map((item: MessageDescriptor) =>
    intl.formatMessage(item)
  )
  return <BulletListComponent font={font} id={id} items={formattedItmes} />
}

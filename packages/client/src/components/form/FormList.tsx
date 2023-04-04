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
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import { BulletList } from '@opencrvs/components/lib/BulletList'

export interface IProps {
  list: MessageDescriptor[]
}

const FormListComponent = ({
  list,
  intl,
  ...otherProps
}: IProps & IntlShapeProps) => {
  const localizedList = list.map((item: MessageDescriptor) =>
    intl.formatMessage(item)
  )

  return <BulletList items={localizedList} font="reg16" />
}

export const FormList = injectIntl(FormListComponent)

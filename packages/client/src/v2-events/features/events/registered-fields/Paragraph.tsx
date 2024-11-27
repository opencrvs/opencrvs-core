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
import { FieldProps } from '@opencrvs/commons'
import React from 'react'
import { useIntl } from 'react-intl'

export const Paragraph = ({ id, label }: FieldProps<'PARAGRAPH'>) => {
  const intl = useIntl()

  return <p id={id}>{intl.formatMessage(label)}</p>
}

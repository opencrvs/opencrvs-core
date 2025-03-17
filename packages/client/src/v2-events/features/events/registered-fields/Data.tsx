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

import { useIntl } from 'react-intl'
import { FieldProps } from '@opencrvs/commons/client'

function DataInput({ label, configuration }: FieldProps<'DATA'>) {
  const intl = useIntl()
  console.log(label, configuration)

  return (
    <div>
      <h3>{intl.formatMessage(label)}</h3>
      <div>
        {configuration.data.map((item) => (
          <div key={item.fieldId}>{item.fieldId}</div>
        ))}
      </div>
    </div>
  )
}

export const Data = {
  Input: DataInput,
  Output: null
}

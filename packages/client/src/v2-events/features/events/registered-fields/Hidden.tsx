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

function HiddenInput({ id, value }: { id: string; value?: string }) {
  return (
    <input
      data-testid={`text__${id}`}
      disabled={true}
      id={id}
      name={id}
      type="hidden"
      value={value}
    />
  )
}

export const Hidden = {
  Input: HiddenInput,
  stringify: (value: string | undefined) => {
    return value?.toString() || ''
  }
}

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
  ISelect2Option,
  ISelect2Props,
  Select2
} from '@opencrvs/components/lib/Select/Select2'

export interface IPerformanceSelectOption extends ISelect2Option {
  type?: string
}
interface IOperationalSelectProps
  extends ISelect2Props<IPerformanceSelectOption> {}

export function PerformanceSelect(props: IOperationalSelectProps) {
  return <Select2 {...props} />
}

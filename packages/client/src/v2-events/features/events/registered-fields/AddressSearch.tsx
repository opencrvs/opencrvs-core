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

import {
  AddressFieldValue,
  FieldProps,
  FieldType
} from '@opencrvs/commons/client'

type Props = FieldProps<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
}

function AddressInput(props: Props) {}

function AddressOutput({ value }: { value?: AddressFieldValue }) {}
export function AddressSearch({}: {}) {}

export const Address = {
  Input: AddressInput,
  Output: AddressOutput
  // stringify
}

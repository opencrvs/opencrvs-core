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

import { MessageDescriptor } from 'react-intl'
import { EventState, FieldConfig, EventConfig } from '@opencrvs/commons/client'
import { IndexMap } from '@client/utils'
import {
  FIELD_SEPARATOR,
  makeFormFieldIdFormikCompatible
} from '@client/v2-events/components/forms/utils'

/**
 * Formik has a feature that automatically nests all form keys that have a dot in them.
 * Because our form field ids can have dots in them, we temporarily transform those dots
 * to a different character before passing the data to Formik. This function unflattens
 *
 * @example {'foo.bar.baz': 'quix' } => {'foo____bar____baz': 'quix' }
 */
export function makeFormFieldIdsFormikCompatible<T>(
  data: Record<string, T>
): IndexMap<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      makeFormFieldIdFormikCompatible(key),
      value
    ])
  )
}

export function makeFormikFieldIdsOpenCRVSCompatible<T>(
  data: Record<string, T>
): IndexMap<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key.replaceAll(FIELD_SEPARATOR, '.'),
      value
    ])
  )
}

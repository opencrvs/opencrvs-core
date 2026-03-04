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
/*
 * Formik has a feature that automatically nests all form keys that have a dot in them.
 * Because our form field ids can have dots in them, we temporarily transform those dots
 * to a different character before passing the data to Formik. This function unflattens
 */
const FIELD_SEPARATOR = '____'
const DOT_SEPARATOR = '.'

export function makeFormFieldIdFormikCompatible(fieldId: string) {
  return fieldId.replaceAll(DOT_SEPARATOR, FIELD_SEPARATOR)
}

export function makeFormikFieldIdOpenCRVSCompatible(fieldId: string): string {
  return fieldId.replaceAll(FIELD_SEPARATOR, DOT_SEPARATOR)
}

export interface Stringifiable {
  toString(): string
}

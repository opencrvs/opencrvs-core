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

import { flattenDeep } from 'lodash'
import {
  EventConfig,
  FieldConfig,
  getAllAnnotationFields,
  getDeclarationFields
} from './events'

export function getOrThrow<T>(x: T, message: string) {
  if (x === undefined || x === null) {
    throw new Error(message)
  }

  return x
}

/**
 * @returns All the fields in the event configuration.
 */
export const findAllFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep([
    ...getDeclarationFields(config),
    ...getAllAnnotationFields(config)
  ])
}

export const metadataFields = ['trackingId', 'status'] as const
/**
 * Pre-defined metadata fields that can be used in advanced search
 * and are not part of the event configuration
 */
export type MetadataField = (typeof metadataFields)[number]

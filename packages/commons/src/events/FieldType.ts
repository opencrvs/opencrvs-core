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

import * as z from 'zod/v4'

export const FieldType = {
  NAME: 'NAME',
  PHONE: 'PHONE',
  ID: 'ID',
  ADDRESS: 'ADDRESS',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  NUMBER_WITH_UNIT: 'NUMBER_WITH_UNIT',
  TEXTAREA: 'TEXTAREA',
  EMAIL: 'EMAIL',
  DATE: 'DATE',
  AGE: 'AGE',
  DATE_RANGE: 'DATE_RANGE', // // Internal use, only for search functionality
  SELECT_DATE_RANGE: 'SELECT_DATE_RANGE', // Internal use, only for search functionality
  TIME: 'TIME',
  PARAGRAPH: 'PARAGRAPH',
  PAGE_HEADER: 'PAGE_HEADER',
  RADIO_GROUP: 'RADIO_GROUP',
  FILE: 'FILE',
  FILE_WITH_OPTIONS: 'FILE_WITH_OPTIONS',
  BULLET_LIST: 'BULLET_LIST',
  CHECKBOX: 'CHECKBOX',
  SELECT: 'SELECT',
  COUNTRY: 'COUNTRY',
  LOCATION: 'LOCATION',
  DIVIDER: 'DIVIDER',
  ADMINISTRATIVE_AREA: 'ADMINISTRATIVE_AREA',
  FACILITY: 'FACILITY',
  OFFICE: 'OFFICE',
  SIGNATURE: 'SIGNATURE',
  DATA: 'DATA',
  BUTTON: 'BUTTON',
  SEARCH: 'SEARCH',
  ALPHA_PRINT_BUTTON: 'ALPHA_PRINT_BUTTON',
  HTTP: 'HTTP',
  LINK_BUTTON: 'LINK_BUTTON',
  VERIFICATION_STATUS: 'VERIFICATION_STATUS',
  QUERY_PARAM_READER: 'QUERY_PARAM_READER',
  QR_READER: 'QR_READER',
  ID_READER: 'ID_READER',
  LOADER: 'LOADER',
  ALPHA_HIDDEN: 'ALPHA_HIDDEN',
  /**
   * @internal
   * @experimental
   *
   * Internal API used by the OpenCRVS core team for experimentation.
   *
   * This component is not part of the public, stable API.
   * Its shape, behavior, or existence may change at any time or be removed
   * entirely without notice.
   */
  _EXPERIMENTAL_CUSTOM: 'CUSTOM'
} as const

/**
 * Union of types that handle files. Using common type should help with compiler to know where to add new cases.
 */
export const FileFieldType = z.enum([
  FieldType.FILE,
  FieldType.FILE_WITH_OPTIONS,
  FieldType.SIGNATURE
])

export const fieldTypes = Object.values(FieldType)
export type FieldType = (typeof fieldTypes)[number]

/**
 * Composite field types are field types that consist of multiple field values.
 */
export const compositeFieldTypes = [
  FieldType.NAME,
  FieldType.DATE_RANGE,
  FieldType.ADDRESS,
  FieldType.FILE_WITH_OPTIONS,
  FieldType.FILE,
  FieldType.ID_READER,
  FieldType.DATA
]

export const FieldTypesToHideInReview = [
  FieldType.BULLET_LIST,
  FieldType.DIVIDER,
  FieldType.PAGE_HEADER,
  FieldType.PARAGRAPH,
  FieldType.ID_READER,
  FieldType.LOADER,
  FieldType.HTTP,
  FieldType.QUERY_PARAM_READER,
  FieldType.DATA,
  FieldType.ALPHA_HIDDEN
]

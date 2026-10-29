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

/**
 * A custom field module (FieldType._EXPERIMENTAL_CUSTOM) must use the React
 * of the client: a second copy of React cannot run hooks in the client's
 * render tree. The client puts its own modules on this global before it
 * loads a custom field module, and the toolkit bundler plugin makes the
 * imports below read from it.
 */
export const CUSTOM_FIELD_EXTERNALS_GLOBAL =
  '__OPENCRVS_CUSTOM_FIELD_EXTERNALS__'

/** Imports in a custom field module that resolve to the client's modules */
export const CUSTOM_FIELD_EXTERNAL_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom'
] as const

export type CustomFieldExternalModule =
  (typeof CUSTOM_FIELD_EXTERNAL_MODULES)[number]

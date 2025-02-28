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
export * from './search'
// eslint-disable-next-line import/export
export * from './events'
export * from './scopes'
export * from './documents'
export * from './workqueues'
export * from './uuid'
export * from './utils'
// eslint-disable-next-line import/export
export * from './conditionals/validate'
export { DEFAULT_ROLES_DEFINITION } from './authentication'
export * from './fixtures'

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

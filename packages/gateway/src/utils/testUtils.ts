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

import { GQLResolver } from '@gateway/graphql/schema'

type IsResolver<T> = T extends (...args: any[]) => any ? true : false

type MakeAllButFirstParamUndefined<F> = F extends (
  arg1: infer A,
  ...args: Array<any>
) => infer R
  ? ((arg1: A) => R) & ((arg1: A, ...args: any[]) => R)
  : F

type DeepRequired<T> = Required<{
  [P in keyof T]: IsResolver<NonNullable<T[P]>> extends true
    ? MakeAllButFirstParamUndefined<NonNullable<T[P]>>
    : NonNullable<T[P]> extends Record<any, any>
    ? DeepRequired<T[P]>
    : never
}>

export type TestResolvers = DeepRequired<GQLResolver>

export const mockUser = {
  systemRole: 'CHAIRMAN',
  role: {
    _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    labels: [
      { label: 'Field Agent', lang: 'en' },
      { label: 'Agent de terrain', lang: 'fr' }
    ]
  },
  name: [
    {
      firstNames: 'Kennedy',
      familyName: 'Mweene',
      use: 'en'
    }
  ]
}

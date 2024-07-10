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
// https://dnlytras.com/blog/nominal-types
declare const __nominal__type: unique symbol
export type Nominal<Type, Identifier extends string> = Type & {
  readonly [__nominal__type]: Identifier
}

declare const __nominal__type__2: unique symbol

export type NestedNominal<
  K extends { readonly [__nominal__type]: any },
  Identifier extends string
> = Omit<K, typeof __nominal__type> & {
  readonly [__nominal__type]: Identifier
  readonly [__nominal__type__2]: K[typeof __nominal__type]
}

export type IsNominal<T> = typeof __nominal__type extends keyof NonNullable<T>
  ? true
  : false

export type IfNominalType<Value, Output> = IsNominal<Value> extends true
  ? Output
  : never

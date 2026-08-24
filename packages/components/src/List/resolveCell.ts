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
import React from 'react'

export interface ValueColumn {
  value?: React.ReactNode
  placeholder?: React.ReactNode
  redacted?: boolean
}

/**
 * A value column is in exactly one of these states. They are three different
 * things and must not be rendered alike: a value; no value; a value the reader
 * is not permitted to see.
 */
export type Cell =
  | { kind: 'redacted' }
  | { kind: 'value'; content: React.ReactNode }
  | { kind: 'placeholder'; content: React.ReactNode }
  | { kind: 'empty' }

/**
 * True for everything React renders as nothing. `false` matters most: a caller
 * writing `actions={canEdit && <Link/>}` passes `false` when it cannot edit,
 * and that must not reserve a column.
 */
export const rendersNothing = (node: React.ReactNode) =>
  node === undefined ||
  node === null ||
  node === false ||
  node === true ||
  node === ''

/**
 * Resolves one column to the single thing it renders. `redacted` wins over a
 * value so that turning it on can never leak the value it replaces.
 */
export function resolveCell({
  value,
  placeholder,
  redacted
}: ValueColumn): Cell {
  if (redacted) {
    return { kind: 'redacted' }
  }

  if (!rendersNothing(value)) {
    return { kind: 'value', content: value }
  }

  if (!rendersNothing(placeholder)) {
    return { kind: 'placeholder', content: placeholder }
  }

  return { kind: 'empty' }
}

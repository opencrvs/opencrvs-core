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
import { createContext, useContext } from 'react'

/**
 * Which optional columns the list has, derived once by `<List>` from its
 * children. Every row then renders the same cells — empty where it has no
 * content — so a list with actions on only some rows still lines up.
 */
export interface ListColumns {
  start: boolean
  value2: boolean
  actions: boolean
}

export interface ListContextValue {
  columns: ListColumns
  /**
   * Accessible name for a redacted cell's bar — the only way a screen reader
   * can tell a withheld value from an absent one. Supplied translated by the
   * consumer, since this package does not format messages.
   */
  redactedLabel?: string
}

const DEFAULT: ListContextValue = {
  columns: { start: false, value2: false, actions: false }
}

export const ListContext = createContext<ListContextValue>(DEFAULT)

export const useListContext = () => useContext(ListContext)

/** Label and first value are always present; the rest are optional. */
export const columnCount = (columns: ListColumns) =>
  2 + Number(columns.start) + Number(columns.value2) + Number(columns.actions)

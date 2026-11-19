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
interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}

// A plain line diff (longest common subsequence). The files are a few hundred lines at most.
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split('\n')
  const b = after.split('\n')
  if (a.length * b.length > 4_000_000) {
    return [...a.map((text) => ({ type: 'remove' as const, text })), ...b.map((text) => ({ type: 'add' as const, text }))]
  }

  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] = a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!)
    }
  }

  const result: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ type: 'same', text: a[i]! })
      i++
      j++
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      result.push({ type: 'remove', text: a[i++]! })
    } else {
      result.push({ type: 'add', text: b[j++]! })
    }
  }
  while (i < a.length) result.push({ type: 'remove', text: a[i++]! })
  while (j < b.length) result.push({ type: 'add', text: b[j++]! })
  return result
}

export const changedLines = (diff: DiffLine[]) => diff.filter((line) => line.type !== 'same').length

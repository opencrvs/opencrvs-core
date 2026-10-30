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
import { useState } from 'react'

export function Stars({
  id,
  value,
  max,
  disabled,
  onSelect,
  onBlur
}: {
  id: string
  value?: number
  max: number
  disabled?: boolean
  onSelect: (level: number) => void
  onBlur?: (event: unknown) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const shown = hovered ?? value ?? 0

  return (
    <div
      id={id}
      role="radiogroup"
      style={{ display: 'flex', gap: 4 }}
      onBlur={onBlur}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const level = index + 1
        return (
          <button
            key={level}
            aria-checked={value === level}
            aria-label={`${level} of ${max}`}
            disabled={disabled}
            id={`${id}-${level}`}
            role="radio"
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              fontSize: 32,
              lineHeight: 1,
              cursor: disabled ? 'default' : 'pointer',
              color: level <= shown ? '#f5a623' : '#c4c4c4'
            }}
            type="button"
            onClick={() => onSelect(level)}
            onMouseEnter={() => setHovered(level)}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

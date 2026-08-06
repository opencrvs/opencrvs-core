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

import { css } from 'styled-components'

export const base = css`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--alert-line);
  background: var(--alert-tint);
`

/*
 * Each tone names three colours and nothing else. The icon and the title read
 * `--alert-ink`, so neither needs to know which type it is in.
 *
 * Ink is the dark tone rather than the mid one: the mid tones fail WCAG AA
 * against their own tint — warning measures 2.14:1, info 2.87:1. The border
 * keeps the mid tone, since it carries no text.
 */
export const success = css`
  --alert-line: ${({ theme }) => theme.colors.positive};
  --alert-tint: ${({ theme }) => theme.colors.greenLighter};
  --alert-ink: ${({ theme }) => theme.colors.greenDark};
`

export const warning = css`
  --alert-line: ${({ theme }) => theme.colors.orange};
  --alert-tint: ${({ theme }) => theme.colors.orangeLighter};
  --alert-ink: ${({ theme }) => theme.colors.orangeDark};
`

export const error = css`
  --alert-line: ${({ theme }) => theme.colors.negative};
  --alert-tint: ${({ theme }) => theme.colors.redLighter};
  --alert-ink: ${({ theme }) => theme.colors.redDark};
`

export const info = css`
  --alert-line: ${({ theme }) => theme.colors.primary};
  --alert-tint: ${({ theme }) => theme.colors.primaryLighter};
  --alert-ink: ${({ theme }) => theme.colors.primaryDark};
`

/* Loading is an info alert that has not resolved yet, so it reads the same. */
export const loading = info

export const iconArea = css`
  flex: 0 0 auto;
  display: flex;
  color: var(--alert-ink);
`

export const content = css`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const title = css`
  ${({ theme }) => theme.fonts.bold14};
  color: var(--alert-ink);
`

export const message = css`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.copy};
`

/*
 * The action sits under the message rather than beside it, so a long message
 * keeps the full width and a long label is not squeezed into a column.
 */
export const actions = css`
  display: flex;
  margin-top: 4px;
  margin-left: -8px;
`

export const close = css`
  flex: 0 0 auto;
  margin: -8px -8px 0 0;
`

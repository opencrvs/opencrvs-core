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
  border: 1px solid var(--alert-color);
  background: var(--alert-background);
`

export const success = css`
  --alert-color: ${({ theme }) => theme.colors.greenDark};
  --alert-background: ${({ theme }) => theme.colors.greenLighter};
`

export const warning = css`
  --alert-color: ${({ theme }) => theme.colors.orangeDark};
  --alert-background: ${({ theme }) => theme.colors.orangeLighter};
`

export const error = css`
  --alert-color: ${({ theme }) => theme.colors.redDark};
  --alert-background: ${({ theme }) => theme.colors.redLighter};
`

export const info = css`
  --alert-color: ${({ theme }) => theme.colors.primaryDark};
  --alert-background: ${({ theme }) => theme.colors.primaryLighter};
`

export const iconArea = css`
  flex: 0 0 auto;
  display: flex;
  color: var(--alert-color);
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
  color: var(--alert-color);
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

/* Pinned to the corner whatever the content does, and however tall it is. */
export const close = css`
  flex: 0 0 auto;
  align-self: flex-start;
  margin: -8px -8px 0 auto;
`

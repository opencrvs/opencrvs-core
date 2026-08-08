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

/** Colours and fonts here approximate the v4 tokens; they are realigned to Figma separately. */

/** The leading slot holds a 40px avatar or icon, plus its gap to the label. */
export const START_COLUMN_WIDTH = '52px'

/**
 * The trailing gutter is reserved for the whole table, so the value columns sit
 * at the same x whether or not a given row has actions.
 */
export const ACTIONS_COLUMN_WIDTH = '96px'

const stackedBelow = (styles: ReturnType<typeof css>) => css`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${styles}
  }
`

export const table = css`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`

export const row = css`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

export const cell = css`
  padding: 16px 0;
  vertical-align: top;
  text-align: left;
  word-wrap: anywhere;
`

export const startCell = css`
  ${cell}
  padding-right: 12px;
`

export const labelCell = css`
  ${cell}
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.copy};
  padding-right: 16px;

  ${stackedBelow(css`
    display: block;
    width: 100%;
    padding-bottom: 0;
  `)}
`

export const description = css`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.supportingCopy};
  margin-top: 4px;
`

export const valueCell = css`
  ${cell}
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.supportingCopy};
  padding-right: 16px;

  ${stackedBelow(css`
    display: block;
    width: 100%;
    padding-top: 8px;
  `)}
`

export const placeholder = css`
  color: ${({ theme }) => theme.colors.disabled};
`

/**
 * A constant width whatever it replaces — a bar that varied with the value
 * would leak its length.
 */
export const redactionBar = css`
  display: inline-block;
  width: 120px;
  height: 8px;
  border-radius: 4px;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.disabled};
`

export const actionsCell = css`
  ${cell}
  text-align: right;

  ${stackedBelow(css`
    vertical-align: top;
  `)}
`

export const actions = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`

/*
 * A break in the list rather than a row: no rule of its own, and enough space
 * above it to separate it from the rows it follows.
 */
export const headingRow = css`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

export const headingCell = css`
  color: ${({ theme }) => theme.colors.copy};
  text-align: left;
  padding: 24px 0 8px;
`

export const headerRow = css`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};

  ${stackedBelow(css`
    display: none;
  `)}
`

export const headerCell = css`
  ${({ theme }) => theme.fonts.bold12};
  color: ${({ theme }) => theme.colors.supportingCopy};
  text-transform: uppercase;
  text-align: left;
  padding: 12px 16px 12px 0;
`

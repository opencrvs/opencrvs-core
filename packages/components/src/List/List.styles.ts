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

/*
 * Every table box changes together. A table-row left among block children makes
 * the browser generate anonymous cells around them.
 */
export const table = css`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  ${stackedBelow(css`
    display: block;
  `)}
`

export const rowGroup = css`
  ${stackedBelow(css`
    display: block;
  `)}
`

/*
 * Stacked, the row places its own cells: the leading slot and the actions keep
 * the edges, and the label and its values stack up the middle.
 */
export const row = css`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};

  /* The rule separates two rows, so the last row has nothing to separate. */
  &:last-child {
    border-bottom: none;
  }

  ${stackedBelow(css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
  `)}
`

/*
 * A leading slot holds a fixed-height object — an avatar, an icon — and the row
 * reads as one thing standing beside it. So its cells centre on that object
 * instead of each starting at the top.
 */
export const rowCentered = css`
  > th,
  > td {
    vertical-align: middle;
  }

  ${stackedBelow(css`
    align-items: center;
  `)}
`

const cell = css`
  padding: 16px 0;
  vertical-align: top;
  text-align: left;
  word-wrap: anywhere;
`

export const startCell = css`
  ${cell}
  padding-right: 12px;

  ${stackedBelow(css`
    display: block;
    grid-column: 1;
    grid-row: 1;
  `)}
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
    grid-column: 2;
    grid-row: 1;
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
  color: ${({ theme }) => theme.colors.copy};
  padding-right: 16px;

  ${stackedBelow(css`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    padding-top: 8px;
    grid-column: 2;
  `)}
`

/*
 * Which column a stacked value belongs to. Hidden while the list is a table,
 * where the column header says it; shown once it stacks, because the header
 * row is gone by then — and with it, for a screen reader, the cell's
 * association with its column.
 */
export const columnName = css`
  display: none;
  color: ${({ theme }) => theme.colors.grey500};

  ${stackedBelow(css`
    display: inline;
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
    display: block;
    grid-column: 3;
    grid-row: 1;
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

  ${stackedBelow(css`
    display: block;
  `)}
`

export const headingCell = css`
  color: ${({ theme }) => theme.colors.copy};
  text-align: left;
  padding: 24px 0 8px;

  ${stackedBelow(css`
    display: block;
  `)}
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

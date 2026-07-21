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
import * as React from 'react'
import styled from 'styled-components'
import { SortIcon } from '../../icons/SortIcon'
import { SORT_ORDER } from '../shared'

/* v4 design token values not yet available in the theme palette */
const TEXT_SECONDARY = '#525252'
const SURFACE_PRESSED = '#F4F8FE'

/**
 * Workqueue list, header and row implementing the v4 workqueue row design.
 *
 * Desktop (> lg) renders a table-style list so the header and every row share
 * column sizing. Mobile (≤ lg) reflows each row into a stacked layout:
 * name + sent on the first line, meta below, flags + actions at the bottom.
 */

const SENT_COLUMN_WIDTH = 200
const FLAGS_COLUMN_WIDTH = 300

export const WorkqueueList = styled.div.attrs({ role: 'table' })`
  width: 100%;
  display: table;
  border-collapse: collapse;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`

const HeaderRow = styled.div`
  display: table-row;
  background: ${({ theme }) => theme.colors.grey50};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const HeaderCell = styled.div<{ width?: number }>`
  display: table-cell;
  vertical-align: middle;
  ${({ width }) => width && `width: ${width}px;`}
  padding: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey400};
`

const headerContentStyles = `
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
`

const HeaderLabel = styled.span`
  ${headerContentStyles}
  ${({ theme }) => theme.fonts.bold14};
  color: ${TEXT_SECONDARY};
`

const HeaderSortButton = styled.button`
  ${headerContentStyles}
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  ${({ theme }) => theme.fonts.bold14};
  color: ${TEXT_SECONDARY};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.yellow};
    outline-offset: -2px;
  }
`

export interface IWorkqueueHeaderCell {
  label?: string
  onSort?: () => void
  isSorted?: boolean
}

export interface IWorkqueueHeaderProps {
  record: IWorkqueueHeaderCell
  sent?: IWorkqueueHeaderCell
  /** Omit to hide the flags column entirely */
  flags?: IWorkqueueHeaderCell
  sortOrder?: SORT_ORDER
}

export function WorkqueueHeader({
  record,
  sent,
  flags,
  sortOrder
}: IWorkqueueHeaderProps) {
  const renderCell = (
    cell: IWorkqueueHeaderCell | undefined,
    width?: number
  ) => (
    <HeaderCell
      aria-sort={
        cell?.onSort
          ? cell.isSorted
            ? sortOrder === SORT_ORDER.DESCENDING
              ? 'descending'
              : 'ascending'
            : 'none'
          : undefined
      }
      role="columnheader"
      width={width}
    >
      {cell?.label &&
        (cell.onSort ? (
          <HeaderSortButton type="button" onClick={cell.onSort}>
            {cell.label}
            <SortIcon
              isDescending={sortOrder === SORT_ORDER.DESCENDING}
              isSorted={Boolean(cell.isSorted)}
            />
          </HeaderSortButton>
        ) : (
          <HeaderLabel>{cell.label}</HeaderLabel>
        ))}
    </HeaderCell>
  )

  return (
    <HeaderRow role="row">
      {renderCell(record)}
      {renderCell(sent, SENT_COLUMN_WIDTH)}
      {flags && renderCell(flags, FLAGS_COLUMN_WIDTH)}
      <HeaderCell role="columnheader" />
    </HeaderRow>
  )
}

const Row = styled.div<{ $clickable?: boolean }>`
  display: table-row;
  background: ${({ theme }) => theme.colors.white};

  /*
   * Row hover/pressed states are suppressed while the pointer is over the
   * actions area, so hovering an action button does not suggest the row
   * click. Browsers without :has() drop these rules and keep a plain row.
   */
  ${({ $clickable, theme }) =>
    $clickable &&
    `
    cursor: pointer;

    &:hover:not(:has([data-row-actions]:hover)) {
      background: ${theme.colors.grey50};
    }
    &:active:not(:has([data-row-actions]:hover)) {
      background: ${SURFACE_PRESSED};
    }
  `}
  &:focus-within,
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.yellow};
    outline-offset: -2px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'name sent'
      'meta meta'
      'flags actions';
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
`

const Cell = styled.div`
  display: table-cell;
  vertical-align: middle;
  padding: 16px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
    padding: 0;
    border-bottom: 0;
  }
`

const RecordCell = styled(Cell)`
  max-width: 0;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: contents;
  }
`

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    grid-area: name;
  }
`

const IconSlot = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  width: 20px;
  height: 20px;
`

const Name = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.copy};
`

const Meta = styled.div`
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => theme.fonts.reg14};
  color: ${TEXT_SECONDARY};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    grid-area: meta;
    margin-top: 0;
  }
`

const SentCell = styled(Cell)`
  width: ${SENT_COLUMN_WIDTH}px;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    grid-area: sent;
    width: auto;
    white-space: nowrap;
  }
`

const FlagsCell = styled(Cell)`
  width: ${FLAGS_COLUMN_WIDTH}px;
  max-width: ${FLAGS_COLUMN_WIDTH}px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    grid-area: flags;
    width: auto;
    max-width: none;
    min-height: 28px;
  }
`

const FlagsContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;

  /* Pills truncate their own label when constrained */
  > * {
    max-width: 100%;
  }
`

const ActionsCell = styled(Cell)`
  width: 1px;
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    grid-area: actions;
    width: auto;
    justify-self: end;
  }
`

const ActionsContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.grey200};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

export interface IWorkqueueRowProps {
  id?: string
  /** Optional 20px icon rendered before the record name */
  icon?: React.ReactNode
  /** Record name. May be a link component */
  name: React.ReactNode
  /** Secondary line, e.g. "Birth • KJN342N45 • 02 June 2022" */
  meta?: React.ReactNode
  /** Relative time the record was sent, e.g. "1 day ago" */
  sent?: React.ReactNode
  /** Flag pills */
  flags?: React.ReactNode
  /** Action buttons, right-aligned. Desktop shows a divider before them */
  actions?: React.ReactNode
  /**
   * Makes the whole row a click target. The row itself becomes focusable
   * and responds to Enter/Space for keyboard users.
   */
  onClick?: () => void
  /**
   * Hides the flags cell so the column can be collapsed when no row in the
   * list has flags. Must match the presence of the header's `flags` cell.
   */
  showFlagsColumn?: boolean
  className?: string
}

export function WorkqueueRow({
  id,
  icon,
  name,
  meta,
  sent,
  flags,
  actions,
  onClick,
  showFlagsColumn = true,
  className
}: IWorkqueueRowProps) {
  return (
    <Row
      $clickable={Boolean(onClick)}
      className={className}
      data-testid="workqueue-row"
      id={id}
      role="row"
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (
                (event.key === 'Enter' || event.key === ' ') &&
                event.target === event.currentTarget
              ) {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <RecordCell role="cell">
        <NameRow>
          {icon && <IconSlot>{icon}</IconSlot>}
          <Name>{name}</Name>
        </NameRow>
        {meta && <Meta>{meta}</Meta>}
      </RecordCell>
      <SentCell role="cell">{sent}</SentCell>
      {showFlagsColumn && (
        <FlagsCell role="cell">
          {flags && <FlagsContent>{flags}</FlagsContent>}
        </FlagsCell>
      )}
      <ActionsCell role="cell">
        {actions && (
          <ActionsContent
            data-row-actions
            onClick={(event) => event.stopPropagation()}
          >
            <Divider />
            {actions}
          </ActionsContent>
        )}
      </ActionsCell>
    </Row>
  )
}

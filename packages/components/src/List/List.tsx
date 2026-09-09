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
import styled from 'styled-components'
import * as styles from './List.styles'
import { ListColumns, ListContext } from './ListContext'
import { Header, ListHeaderProps } from './components/Header'
import { Heading } from './components/Heading'
import { Item, ListItemProps, itemColumns } from './components/Item'

/*
 * The roles are the ones these elements already have. Stating them keeps the
 * row and column association when `display` changes, which some engines
 * otherwise drop.
 */
const Table = styled.table`
  ${styles.table}
`

const RowGroup = styled.tbody`
  ${styles.rowGroup}
`

const HeadGroup = styled.thead`
  ${styles.rowGroup}
`

export interface ListProps
  extends Omit<React.HTMLAttributes<HTMLTableElement>, 'children'> {
  /** An optional `<List.Header>`, then the rows. */
  children: React.ReactNode
  /**
   * Translated accessible name for the bar shown in a redacted cell, e.g.
   * "Hidden". Without it a screen reader cannot tell a withheld value from an
   * absent one.
   */
  redactedLabel?: string
}

/** Descends into fragments, so rows may be mapped and keyed by the caller. */
const flatten = (children: React.ReactNode): React.ReactElement[] =>
  React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) {
      return []
    }

    if (child.type === React.Fragment) {
      return flatten((child.props as { children?: React.ReactNode }).children)
    }

    return [child]
  })

/**
 * A vertical list of label / value rows — a record's fields, a set of settings,
 * a team's users. Each row is one thing: the label names it, the value columns
 * describe it, and any actions apply to it.
 *
 * Use `<Table>` instead where the reader compares values down a grid of columns
 * that carry their own affordances — click-to-sort, totals, per-column filters.
 */
export const List = ({ children, redactedLabel, ...props }: ListProps) => {
  const elements = flatten(children)

  const header = elements.find(
    (element): element is React.ReactElement<ListHeaderProps> =>
      element.type === Header
  )

  /* Headings sit among the rows, in source order, so the body keeps both. */
  const body = elements.filter(
    (element) => element.type === Item || element.type === Heading
  )

  const items = body.filter(
    (element): element is React.ReactElement<ListItemProps> =>
      element.type === Item
  )

  /*
   * Which optional columns exist is a property of the list, not of a row: every
   * row renders the same cells so that the columns line up, and the trailing
   * gutter stays reserved on rows that have no actions.
   */
  const columns: ListColumns = items
    .map((item) => itemColumns(item.props))
    .reduce(
      (all, item) => ({
        start: all.start || item.start,
        value: all.value || item.value,
        value2: all.value2 || item.value2,
        actions: all.actions || item.actions
      }),
      {
        start: false,
        value: header?.props.value !== undefined,
        value2: header?.props.value2 !== undefined,
        actions: false
      }
    )

  const columnNames = {
    value: header?.props.value,
    value2: header?.props.value2
  }

  return (
    <ListContext.Provider value={{ columns, columnNames, redactedLabel }}>
      <Table {...props} role="table">
        <colgroup>
          {columns.start && <col width={styles.START_COLUMN_WIDTH} />}
          <col />
          {columns.value && <col />}
          {columns.value2 && <col />}
          {columns.actions && <col width={styles.ACTIONS_COLUMN_WIDTH} />}
        </colgroup>

        {header && <HeadGroup role="rowgroup">{header}</HeadGroup>}
        <RowGroup role="rowgroup">{body}</RowGroup>
      </Table>
    </ListContext.Provider>
  )
}

List.Header = Header
List.Heading = Heading
List.Item = Item

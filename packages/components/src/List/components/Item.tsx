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
import * as styles from '../List.styles'
import { useListContext } from '../ListContext'
import { Cell, rendersNothing, resolveCell, ValueColumn } from '../resolveCell'

const ItemRow = styled.tr`
  ${styles.row}
`

const StartCell = styled.td`
  ${styles.startCell}
`

const LabelCell = styled.th`
  ${styles.labelCell}
`

const Description = styled.div`
  ${styles.description}
`

const ValueCell = styled.td`
  ${styles.valueCell}
`

const Placeholder = styled.span`
  ${styles.placeholder}
`

const RedactionBar = styled.span`
  ${styles.redactionBar}
`

const ActionsCell = styled.td`
  ${styles.actionsCell}
`

const Actions = styled.div`
  ${styles.actions}
`

export interface IListItemProps {
  id?: string
  /** Names the row's subject — a field, a setting, a person. */
  label: React.ReactNode
  /** A second line of secondary text beneath the label. */
  description?: React.ReactNode
  value?: React.ReactNode
  /** Shown in place of `value` when it is empty. */
  placeholder?: React.ReactNode
  /** Shows a bar in place of `value`, for a value the reader may not see. */
  redacted?: boolean
  value2?: React.ReactNode
  placeholder2?: React.ReactNode
  redacted2?: boolean
  /** Leading slot — an avatar, an icon. */
  start?: React.ReactNode
  /** Trailing slot, right-aligned. */
  actions?: React.ReactNode
  'data-testid'?: string
}

const Value = ({
  cell,
  redactedLabel
}: {
  cell: Cell
  redactedLabel?: string
}) => {
  switch (cell.kind) {
    case 'redacted':
      return redactedLabel ? (
        <RedactionBar aria-label={redactedLabel} role="img" />
      ) : (
        <RedactionBar aria-hidden />
      )
    case 'value':
      return <>{cell.content}</>
    case 'placeholder':
      return <Placeholder>{cell.content}</Placeholder>
    case 'empty':
      return null
  }
}

/** One row of a `<List>`. */
export const Item = ({
  id,
  label,
  description,
  value,
  placeholder,
  redacted,
  value2,
  placeholder2,
  redacted2,
  start,
  actions,
  ...props
}: IListItemProps) => {
  const { columns, redactedLabel } = useListContext()
  const testId = props['data-testid']

  return (
    <ItemRow id={id}>
      {columns.start && <StartCell>{start}</StartCell>}

      <LabelCell data-testid={testId && `${testId}-key`} scope="row">
        {label}
        {description && <Description>{description}</Description>}
      </LabelCell>

      <ValueCell
        data-testclass={redacted ? 'redacted' : undefined}
        data-testid={testId && `${testId}-value`}
      >
        <Value
          cell={resolveCell({ value, placeholder, redacted })}
          redactedLabel={redactedLabel}
        />
      </ValueCell>

      {columns.value2 && (
        <ValueCell
          data-testclass={redacted2 ? 'redacted' : undefined}
          data-testid={testId && `${testId}-value2`}
        >
          <Value
            cell={resolveCell({
              value: value2,
              placeholder: placeholder2,
              redacted: redacted2
            })}
            redactedLabel={redactedLabel}
          />
        </ValueCell>
      )}

      {columns.actions && (
        <ActionsCell>{actions && <Actions>{actions}</Actions>}</ActionsCell>
      )}
    </ItemRow>
  )
}

/** The value columns this row occupies, read by `<List>` to size the table. */
export const itemColumns = (
  props: IListItemProps
): { start: boolean; value2: boolean; actions: boolean } => ({
  start: !rendersNothing(props.start),
  value2: hasContent({
    value: props.value2,
    placeholder: props.placeholder2,
    redacted: props.redacted2
  }),
  actions: !rendersNothing(props.actions)
})

const hasContent = (column: ValueColumn) => resolveCell(column).kind !== 'empty'

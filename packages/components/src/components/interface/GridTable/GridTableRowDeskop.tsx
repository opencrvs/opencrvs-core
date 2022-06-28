/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { IDynamicValues, IAction, IColumn } from './types'
import styled from 'styled-components'
import { IActionObject, ColumnContentAlignment } from '..'

export interface IGridTableRow {
  displayItems: IDynamicValues[]
  columns: IColumn[]
  getRowClickHandler: (
    itemRowClickHandler: IActionObject[]
  ) => (e?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => void
  renderActionBlock: (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    idKey: number,
    alignment?: ColumnContentAlignment | undefined
  ) => JSX.Element
  clickable: boolean | undefined
  hideLastBorder?: boolean
}

const StyledBox = styled.div<{ hideLastBorder?: boolean }>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  &:last-child {
    ${({ hideLastBorder }) => hideLastBorder && ` border-bottom: 0;`}
  }

  height: 72px;
`

export const RowWrapper = styled.div<{
  clickable?: boolean
}>`
  width: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`

export const ContentWrapper = styled.div<{
  width: number
  alignment?: string
  color?: string
  paddingRight?: number | null
}>`
  width: ${({ width }) => width}%;
  display: inline-block;
  position: relative;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  ${({ color }) => color && `color: ${color};`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
`

export const IconWrapper = styled(ContentWrapper)`
  padding-top: 8px;
`

export const GridTableRowDesktop = (props: IGridTableRow) => {
  return (
    <>
      {props.displayItems.map((item, index) => {
        const clickable = props.clickable || Boolean(item.rowClickable)
        return (
          <StyledBox key={index} hideLastBorder={props.hideLastBorder}>
            <RowWrapper
              id={`row-${index}`}
              clickable={clickable}
              onClick={() =>
                clickable &&
                props.getRowClickHandler(
                  item.rowClickHandler as IActionObject[]
                )()
              }
            >
              {props.columns.map((preference, indx) => {
                if (preference.isActionColumn) {
                  return props.renderActionBlock(
                    item.id as string,
                    item[preference.key] as IAction[],
                    preference.width,
                    index,
                    indx,
                    preference.alignment
                  )
                } else if (preference.isIconColumn) {
                  return (
                    <IconWrapper
                      key={indx}
                      width={preference.width}
                      alignment={preference.alignment}
                      color={preference.color}
                    >
                      {(item.icon as JSX.Element) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </IconWrapper>
                  )
                } else {
                  return (
                    <ContentWrapper
                      key={indx}
                      width={preference.width}
                      alignment={preference.alignment}
                      color={preference.color}
                    >
                      {(item[preference.key] as string) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </ContentWrapper>
                  )
                }
              })}
            </RowWrapper>
          </StyledBox>
        )
      })}
    </>
  )
}

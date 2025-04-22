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
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { SortIcon } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  grid,
  IAction,
  IActionObject,
  IColumn,
  ListItemAction,
  WorkqueueRowDesktop
} from '@opencrvs/components'
import { EventIndex } from '@opencrvs/commons'
import { eventQueryDataGenerator } from '@opencrvs/commons/client'

/*
<SearchResults
  query={{
    status: { type: 'oneOf', terms: ['DECLARED'] },
    type: { type: 'exact', term: 'birth' },
    data: {
      'child.name': { type: 'fuzzy', term: 'John' },
      'child.birthDate': { type: 'range', gte: '2020-01-01', lte: '2020-12-31' },
      'mother.address': {
        country: { type: 'exact', term: 'FIN' }
      }
    }
  }}
/>

*/

const Wrapper = styled.div`
  width: 100%;
  border: 1px solid red;
`

const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  background-color: ${({ theme }) => theme.colors.grey100};
  ${({ theme }) => theme.fonts.bold14};
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

export const NoResultText = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
  text-align: left;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    text-align: center;
  }
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  color?: string
  paddingRight?: number | null
}>`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: ${({ paddingRight }) => (paddingRight ? paddingRight : 10)}px;
  ${({ color }) => color && `color: ${color};`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ColumnContainer = styled.div<{
  width: number
  clickable: boolean
}>`
  width: ${({ width }) => width}%;
  display: flex;
  ${({ clickable }) => clickable && `cursor: pointer;`}
`

const ColumnTitleWrapper = styled.div<{ alignment?: string }>`
  align-self: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`

const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
`

export const SearchResults = ({ columns }: { columns: IColumn[] }) => {
  /* const { status, type, data } = query */
  const { width } = useWindowSize()
  const hideTableHeader = false // This should be a prop or state
  const content: EventIndex[] = [eventQueryDataGenerator()] // This should be the actual content based on the query
  const sortOrder = 'ASCENDING' // This should be a state or prop
  const SORT_ORDER = {
    ASCENDING: 'ASCENDING',
    DESCENDING: 'DESCENDING'
  }

  const getRowClickHandler = (itemRowClickHandler: IActionObject[]) => {
    return itemRowClickHandler[0].handler
  }

  const renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    idKey: number,
    alignment?: ColumnContentAlignment
  ) => {
    return (
      <ActionWrapper key={idKey} alignment={alignment} width={width}>
        <ListItemAction actions={actions} id={`ListItemAction-${key}`} />
      </ActionWrapper>
    )
  }
  return (
    <Wrapper>
      <TableHeader>
        {columns.map((preference, index) => (
          <ColumnContainer
            key={index}
            clickable={false}
            width={preference.width}
            onClick={() => {}}
          >
            <ColumnTitleWrapper>
              {preference.label && preference.label}
              {preference.sortFunction && (
                <SortIcon
                  isDescending={sortOrder === SORT_ORDER.DESCENDING}
                  isSorted={Boolean(preference.isSorted)}
                />
              )}
            </ColumnTitleWrapper>
          </ColumnContainer>
        ))}
      </TableHeader>
      <WorkqueueRowDesktop
        clickable={false}
        columns={columns}
        displayItems={content}
        getRowClickHandler={getRowClickHandler}
        renderActionBlock={renderActionBlock}
      />
    </Wrapper>
  )
}

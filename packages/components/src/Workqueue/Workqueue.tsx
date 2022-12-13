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
import styled, { withTheme } from 'styled-components'
import { grid } from '../grid'
import { IDynamicValues, IColumn, IActionObject } from './types'
import {
  WorkqueueRowDesktop,
  ContentWrapper
} from './components/WorkqueueRowDesktop'
import { WorkqueueRowMobile } from './components/WorkqueueRowMobile'
import { ITheme } from '../theme'
import { SortIcon } from '../icons/SortIcon'
import { IAction } from '../common-types'
import { ListItemAction } from './components/ListItemAction'

const Wrapper = styled.div`
  width: 100%;
`
const TableHeader = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: ${({ theme }) => theme.colors.grey400};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  ${({ theme }) => theme.fonts.bold12Cap};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

export const NoResultText = styled.div`
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    justify-content: center;
    border-bottom: none;
  }
`
const ColumnContainer = styled.div<{
  width: number
  clickable: boolean
}>`
  width: ${({ width }) => width}%;
  display: flex;
  ${({ clickable }) => clickable && `cursor: pointer;`}
`

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export enum COLUMNS {
  ICON_WITH_NAME = 'iconWithName',
  ICON_WITH_NAME_EVENT = 'iconWithNameEvent',
  EVENT = 'event',
  DATE_OF_EVENT = 'dateOfEvent',
  SENT_FOR_REVIEW = 'sentForReview',
  SENT_FOR_UPDATES = 'sentForUpdates',
  SENT_FOR_APPROVAL = 'sentForApproval',
  SENT_FOR_VALIDATION = 'sentForValidation',
  REGISTERED = 'registered',
  LAST_UPDATED = 'lastUpdated',
  ACTIONS = 'actions',
  NOTIFICATION_SENT = 'notificationSent',
  NAME = 'name'
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

const ColumnTitle = styled.div<{ alignment?: string }>`
  justify-content: ${({ alignment }) =>
    alignment ? alignment.toString() : 'flex-start'};
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`

interface IComponentWithTheme {
  theme: ITheme
}

interface IWorkqueueProps extends IComponentWithTheme {
  /** Workqueue data */
  content: IDynamicValues[]
  /** Data columns */
  columns: IColumn[]
  /** Text if there are now content on the table */
  noResultText?: string
  /** Hides `noResultText` if true */
  loading?: boolean
  /** Hides Workqueue header */
  hideTableHeader?: boolean
  /** Globally enables or disables clickable headers */
  clickable?: boolean
  /** Sets the direction of the sort icon */
  sortOrder?: SORT_ORDER
}

interface IWorkqueueState {
  width: number
  expanded: string[]
}

export class WorkqueueComp extends React.Component<
  IWorkqueueProps,
  IWorkqueueState
> {
  state = {
    width: window.innerWidth,
    expanded: []
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    idKey: number,
    alignment?: ColumnContentAlignment
  ) => {
    return (
      <ContentWrapper key={idKey} width={width}>
        <ListItemAction id={`ListItemAction-${key}`} actions={actions} />
      </ContentWrapper>
    )
  }

  getRowClickHandler = (itemRowClickHandler: IActionObject[]) => {
    return itemRowClickHandler[0].handler
  }

  render() {
    const { columns, content, noResultText, hideTableHeader, sortOrder } =
      this.props
    const { width } = this.state
    const isMobileView = this.state.width < this.props.theme.grid.breakpoints.lg
    return (
      <Wrapper>
        {width > grid.breakpoints.lg && !hideTableHeader && (
          <TableHeader>
            {columns.map((preference, index) => (
              <ColumnContainer
                key={index}
                width={preference.width}
                onClick={
                  preference.sortFunction
                    ? () => preference.sortFunction!(preference.key)
                    : undefined
                }
                clickable={Boolean(preference.sortFunction)}
              >
                <ColumnTitle>
                  {preference.label && preference.label}
                  {preference.sortFunction && (
                    <SortIcon
                      isSorted={Boolean(preference.isSorted)}
                      isDescending={sortOrder === SORT_ORDER.DESCENDING}
                    />
                  )}
                </ColumnTitle>
              </ColumnContainer>
            ))}
          </TableHeader>
        )}
        {!isMobileView ? (
          <WorkqueueRowDesktop
            columns={this.props.columns}
            displayItems={content}
            clickable={this.props.clickable}
            getRowClickHandler={this.getRowClickHandler}
            renderActionBlock={this.renderActionBlock}
          />
        ) : (
          <WorkqueueRowMobile
            columns={this.props.columns}
            displayItems={content}
            clickable={this.props.clickable}
            getRowClickHandler={this.getRowClickHandler}
            renderActionBlock={this.renderActionBlock}
          />
        )}
        {!this.props.loading && noResultText && content.length <= 0 && (
          <NoResultText id="no-record">{noResultText}</NoResultText>
        )}
      </Wrapper>
    )
  }
}

export const Workqueue = withTheme(WorkqueueComp)

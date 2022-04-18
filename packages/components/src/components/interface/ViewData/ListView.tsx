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
import { isString } from 'lodash'
import * as React from 'react'
import styled from 'styled-components'
import { IListRowProps, ListRow } from './ListRow'
import { LinkButton } from '../../buttons'

const Container = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
`
const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ theme }) => theme.fonts.h2};
  margin-bottom: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h3};
    flex-direction: column;
    align-items: flex-start;
    button > div {
      padding: 0;
    }
    gap: 0;
  }
`

interface IAction {
  id?: string
  label: string
  disabled?: boolean
  handler: () => void
}

const ResponsiveContainer = styled.div<{ isConfigPage?: boolean }>`
  display: ${({ isConfigPage }) => (isConfigPage === true ? 'block' : 'none')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`
interface IProps {
  id?: string
  title?: string
  items: IListRowProps[]
  responsiveContents?: React.ReactNode
  action?: IAction
  isConfigPage?: boolean
  noResultText?: string
}

const ErrorText = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
`
export class ListView extends React.Component<IProps> {
  render() {
    const { action, id, title, items, responsiveContents } = this.props

    return (
      <Container id={id}>
        {title && (
          <Title>
            {title}
            {action && (
              <LinkButton onClick={action.handler}>{action.label}</LinkButton>
            )}
          </Title>
        )}
        {responsiveContents && (
          <ResponsiveContainer
            isConfigPage={this.props.isConfigPage && this.props.isConfigPage}
          >
            {responsiveContents}
          </ResponsiveContainer>
        )}
        {items.length <= 0 && (
          <ErrorText id="no-record">{this.props.noResultText}</ErrorText>
        )}
        {items.length > 0 &&
          items.map((item: IListRowProps, index: number) => (
            <ListRow
              id={
                isString(item.label)
                  ? item.label.split(' ').join('-')
                  : 'label-component'
              }
              key={index}
              {...item}
            />
          ))}
      </Container>
    )
  }
}

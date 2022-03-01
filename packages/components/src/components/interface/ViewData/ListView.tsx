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

const Container = styled.div`
  margin-top: 48px;
  margin-bottom: 30px;
`
const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h5Style};
  }
`

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
  isConfigPage?: boolean
}

export class ListView extends React.Component<IProps> {
  render() {
    const { id, title, items, responsiveContents } = this.props

    return (
      <Container id={id}>
        {title && <Title>{title}</Title>}
        {responsiveContents && (
          <ResponsiveContainer
            isConfigPage={this.props.isConfigPage && this.props.isConfigPage}
          >
            {responsiveContents}
          </ResponsiveContainer>
        )}
        {items.map((item: IListRowProps, index: number) => (
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

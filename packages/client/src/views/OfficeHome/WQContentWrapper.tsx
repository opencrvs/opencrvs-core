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
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import styled from 'styled-components'
import { NoResultText } from '@opencrvs/components/lib/Workqueue'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { Stack } from '@opencrvs/components/lib/Stack'
import {
  LoadingIndicator,
  withOnlineStatus,
  IOnlineStatusProps
} from '@client/views/OfficeHome/LoadingIndicator'

interface IContentWrapper {
  isMobileSize: boolean
  title: string
  children: React.ReactNode | React.ReactNode[]
  tabBarContent?: React.ReactNode
  paginationId?: number
  totalPages?: number
  onPageChange?: (newPageNumber: number) => void
  noResultText?: string
  noContent?: boolean
  loading?: boolean
  error?: boolean
}

type IProps = IContentWrapper & IOnlineStatusProps

const TabBarContainer = styled.div`
  overflow: scroll;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.white};
  padding-left: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const MobileChildrenContainer = styled.div`
  margin: 20px 16px 0;
`

const Body = (props: IProps) => {
  const {
    paginationId,
    totalPages,
    onPageChange,
    loading,
    error,
    isOnline,
    noContent
  } = props
  return (
    <>
      {props.children}
      {noContent && (
        <NoResultText id="no-record">{props.noResultText}</NoResultText>
      )}
      <Stack>
        {paginationId && totalPages && onPageChange && isOnline && (
          <Pagination
            currentPage={paginationId}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
        <LoadingIndicator
          loading={loading ? true : false}
          hasError={error ? true : false}
          noDeclaration={noContent}
        />
      </Stack>
    </>
  )
}

const WQContentWrapperComp = (props: IProps) => {
  return (
    <>
      {props.isMobileSize ? (
        <>
          {props.tabBarContent && (
            <TabBarContainer>{props.tabBarContent}</TabBarContainer>
          )}
          <MobileChildrenContainer>
            <Body {...props} />
          </MobileChildrenContainer>
        </>
      ) : (
        <Content
          title={props.title}
          size={ContentSize.LARGE}
          tabBarContent={props.tabBarContent}
        >
          <Body {...props} />
        </Content>
      )}
    </>
  )
}

export const WQContentWrapper = withOnlineStatus(WQContentWrapperComp)

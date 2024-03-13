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

export type IRowListViewSize = 'small' | 'medium'

const Grid = styled.div<{
  bottomBorder: boolean
  rowHeight?: IRowListViewSize
}>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  ${({ rowHeight }) =>
    rowHeight === 'medium' && 'grid-auto-rows: minmax(56px, auto);'}
  ${({ rowHeight }) =>
    rowHeight === 'small' && 'grid-auto-rows: minmax(48px, auto);'}
  ${({ bottomBorder }) => bottomBorder && 'border-bottom: 1px solid'};
  border-color: ${({ theme }) => theme.colors.grey200};
  > div:not(:nth-last-child(-n + 4)) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: auto;
    > div:not(:nth-last-child(-n + 1)) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    }
  }
`

const LabelValueContainer = styled.div`
  display: flex;
  padding: 8px 0;
  grid-column-start: 2;
  gap: 20px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const ValueContainer = styled.div<{ compactLabel?: boolean }>`
  display: flex;
  ${({ compactLabel }) => (!compactLabel ? 'flex: 0 1 50%;' : '')}
  ${({ compactLabel }) => (compactLabel ? 'margin:0 auto;' : '')}
  align-items: center;
  color: ${({ theme }) => theme.colors.grey600};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MobileValueContainer = styled(ValueContainer)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: block;
    padding-left: 0;
    flex: 1;
    grid-row-start: 2;
    grid-column: 2;
    align-items: center;
  }
`

const LabelContainer = styled.div<{ compactLabel?: boolean }>`
  display: flex;
  ${({ compactLabel }) => (!compactLabel ? 'flex: 1 0 50%;' : '')}
  align-items: center;
  button > div {
    padding: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const MobileLabelContainer = styled(LabelContainer)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: block;
    grid-column-start: 2;
    align-self: center;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  padding: 8px 0;
  gap: 8px;
  align-items: center;
  justify-content: right;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const MobileImageContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 16px;
`

const MobileContainer = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: grid;
    padding-top: 8px;
    padding-bottom: 16px;
    grid-template-rows: auto auto;
    grid-template-columns: auto 1fr auto;
  }
`

const MobileActionsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: right;
`

export interface IListViewItemSimplifiedProps {
  image?: React.ReactNode
  label: React.ReactNode
  value?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  compactLabel?: boolean
}

/**
 * Use the list view to summarise information, for example a user’s responce at the declaration form or for showing performance data
 */
export function ListViewItemSimplified({
  image,
  label,
  value,
  className,
  actions,
  compactLabel
}: IListViewItemSimplifiedProps) {
  return (
    <React.Fragment>
      {image && (
        <ImageContainer className={className} data-test-id="list-view-image">
          {image}
        </ImageContainer>
      )}

      <LabelValueContainer className={className}>
        <LabelContainer
          data-test-id="list-view-label"
          compactLabel={compactLabel}
        >
          {label}
        </LabelContainer>

        {value && (
          <ValueContainer
            data-test-id="list-view-value"
            compactLabel={compactLabel}
          >
            {value}
          </ValueContainer>
        )}
      </LabelValueContainer>

      <ActionsContainer className={className} data-test-id="list-view-actions">
        {actions}
      </ActionsContainer>
      <MobileContainer className={className} data-test-id="list-view-mobile">
        {image && <MobileImageContainer>{image}</MobileImageContainer>}
        <MobileLabelContainer>{label}</MobileLabelContainer>
        <MobileActionsContainer>{actions}</MobileActionsContainer>
        {value && <MobileValueContainer>{value}</MobileValueContainer>}
      </MobileContainer>
    </React.Fragment>
  )
}

export function ListViewSimplified({
  className,
  bottomBorder = false,
  children,
  id,
  rowHeight = 'medium'
}: {
  bottomBorder?: boolean
  className?: string
  children: React.ReactNode
  id?: string
  rowHeight?: IRowListViewSize
}) {
  return (
    <Grid
      id={id}
      bottomBorder={bottomBorder}
      rowHeight={rowHeight}
      className={className}
    >
      {children}
    </Grid>
  )
}

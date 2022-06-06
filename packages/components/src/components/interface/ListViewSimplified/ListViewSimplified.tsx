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
import React from 'react'
import styled from 'styled-components'

const Grid = styled.div<{ bottomBorder: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-auto-rows: minmax(56px, auto);
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

const ValueContainer = styled.div`
  display: flex;
  flex: 0 1 50%;
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

const LabelContainer = styled.div`
  display: flex;
  flex: 1 0 50%;
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

interface IListViewItemSimplifiedProps {
  image?: React.ReactNode
  label: React.ReactNode
  value?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function ListViewItemSimplified({
  image,
  label,
  value,
  className,
  actions
}: IListViewItemSimplifiedProps) {
  return (
    <>
      {image && (
        <ImageContainer className={className} data-test-id="list-view-image">
          {image}
        </ImageContainer>
      )}

      <LabelValueContainer className={className}>
        <LabelContainer data-test-id="list-view-label">{label}</LabelContainer>

        {value && (
          <ValueContainer data-test-id="list-view-value">
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
    </>
  )
}

export function ListViewSimplified({
  className,
  bottomBorder = false,
  children,
  id
}: {
  bottomBorder?: boolean
  className?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <Grid id={id} bottomBorder={bottomBorder} className={className}>
      {children}
    </Grid>
  )
}

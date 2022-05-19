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
import { StyledPill } from '../Pill'

const Grid = styled.div<{ bottomBorder: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, 1fr) auto;
  grid-auto-rows: minmax(56px, auto);
  row-gap: 1px;
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

const ValueContainer = styled.div`
  padding: 8px 0;
  padding-left: 20px;
  display: flex;
  color: ${({ theme }) => theme.colors.grey600};
  > span {
    padding-top: 8px;
    padding-bottom: 8px;
  }
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
  padding: 8px 0;
  display: flex;
  flex: 1 0 50%;
  button > div {
    padding: 0;
  }
  > span {
    padding-top: 8px;
    padding-bottom: 8px;
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
  padding: 16px 0;
  gap: 8px;
  justify-content: right;
  ${StyledPill} {
    margin-top: 8px;
  }
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
}

export function ListViewItemSimplified({
  image,
  label,
  value,
  actions
}: IListViewItemSimplifiedProps) {
  return (
    <>
      <ImageContainer data-test-id="list-view-image">{image}</ImageContainer>

      <LabelContainer data-test-id="list-view-label">
        {typeof label === 'string' ? <span>{label}</span> : label}
      </LabelContainer>

      <ValueContainer data-test-id="list-view-value">
        {value && typeof value === 'string' ? <span>{value}</span> : value}
      </ValueContainer>

      <ActionsContainer data-test-id="list-view-actions">
        {actions}
      </ActionsContainer>
      <MobileContainer data-test-id="list-view-mobile">
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
  id,
  ...rest
}: {
  bottomBorder?: boolean
  className?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <Grid {...rest} id={id} bottomBorder={bottomBorder}>
      {children}
    </Grid>
  )
}

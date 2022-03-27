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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-auto-rows: 56px;
  row-gap: 1px;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.colors.grey200};
  background-color: ${({ theme }) => theme.colors.grey200};
  > div {
    background-color: ${({ theme }) => theme.colors.white};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-auto-rows: 102px;
  }
`

const LabelValueContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
`

const Value = styled.div`
  width: 50%;
  color: ${({ theme }) => theme.colors.grey500};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const Label = styled.div`
  width: 50%;
  ${({ theme }) => theme.fonts.bodyBoldStyle}
  button > div {
    padding: 0;
    ${({ theme }) => theme.fonts.bodyBoldStyle}
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
`

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

interface IListViewItemSimplifiedProps {
  avatar?: React.ReactNode
  label: React.ReactNode
  value?: React.ReactNode
  actions?: React.ReactNode[]
}

export function ListViewItemSimplified({
  avatar,
  label,
  value,
  actions
}: IListViewItemSimplifiedProps) {
  return (
    <>
      <AvatarContainer>
        {avatar}
        <LabelValueContainer>
          <Label>{label}</Label>
          <Value>{value}</Value>
        </LabelValueContainer>
      </AvatarContainer>
      <ActionContainer>{actions}</ActionContainer>
    </>
  )
}

export function ListViewSimplified({
  children
}: {
  children: React.ReactNode
}) {
  return <Grid>{children}</Grid>
}

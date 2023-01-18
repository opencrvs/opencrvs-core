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
import styled from '@client/styledComponents'
import { FormTabs, IFormTabs } from '@opencrvs/components/lib/FormTabs'
import { IDeclaration } from '@client/declarations'
import { EMPTY_STRING } from '@client/utils/constants'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  top: 56px;
  width: 100%;
  position: sticky;
  z-index: 1;
`

interface IProps {
  declaration: IDeclaration
}

export const DuplicateFormTabs = (props: IProps) => {
  const [selectedDuplicateComId, setSelectedDuplicateComId] = React.useState(
    props.declaration.id
  )
  const tabs: IFormTabs[] =
    props.declaration.duplicates?.map((duplicateId) => {
      return {
        id: duplicateId.compositionId,
        title: duplicateId.trackingId,
        disabled: false
      }
    }) ?? []

  tabs.unshift({
    id: props.declaration.id,
    title: (props.declaration.data.registration.trackingId as string) || '',
    disabled: false,
    icon: <Icon name={'AlertCircle'} color={'red'} size={'medium'} />,
    color: 'red'
  })

  return (
    <TopBar>
      <FormTabs
        sections={tabs}
        activeTabId={selectedDuplicateComId || EMPTY_STRING}
        onTabClick={(id: string) => {
          setSelectedDuplicateComId(id)
        }}
      />
    </TopBar>
  )
}

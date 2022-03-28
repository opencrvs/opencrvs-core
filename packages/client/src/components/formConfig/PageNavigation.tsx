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
import styled from '@client/styledComponents'
import {
  NavigationSubItem,
  LabelContainer
} from '@opencrvs/components/lib/interface/Navigation/NavigationSubItem'
import { IForm } from '@client/forms'
import { EventType } from '@client/views/SysAdmin/Config/FormConfigWizard'
import { IntlShape } from 'react-intl'
import { configMessage } from '@client/components/formConfig/FormConfig'
import { goToPageNavigation } from '@client/navigation'

const Container = styled.div`
  top: 56px;
  width: 250px;
  position: fixed;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const Title = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  margin-left: 24px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.subtitleStyle}
`

interface IPageNavigation {
  intl: IntlShape
  registerForm: { [key: string]: IForm }
  section?: string
  event?: EventType
  goToPageNavigation: typeof goToPageNavigation
}

export const TAB_BIRTH = {
  introduction: 'introduction',
  child: 'child',
  mother: 'mother',
  father: 'father',
  informant: 'informant',
  documents: 'documents'
}

export const TAB_DEATH = {
  introduction: 'introduction',
  deceased: 'deceased',
  deathEvent: 'deathEvent',
  causeOfDeath: 'causeOfDeath',
  mother: 'mother',
  father: 'father',
  spouse: 'spouse',
  informant: 'informant',
  documents: 'documents'
}

const PageItems = styled(NavigationSubItem)<{ isSelected: boolean }>`
  ${LabelContainer} {
    padding: 7px 38px 9px 29px;
    ${({ theme, isSelected }) => isSelected && theme.fonts.subtitleStyle};
  }
`

export const PageNavigation = (props: IPageNavigation) => {
  const { event, intl, section, goToPageNavigation } = props
  const TAB = event === 'birth' ? TAB_BIRTH : TAB_DEATH

  return (
    <Container>
      <Title>Pages</Title>

      {Object.keys(TAB).map((tab, idx) => (
        <PageItems
          key={idx}
          label={`${idx + 1}. ${intl.formatMessage(
            configMessage[TAB[tab as keyof typeof TAB]]
          )}`}
          isSelected={section === TAB[tab as keyof typeof TAB]}
          onClick={() =>
            goToPageNavigation(event!, TAB[tab as keyof typeof TAB])
          }
        />
      ))}
    </Container>
  )
}

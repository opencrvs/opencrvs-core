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
import { IForm, Event } from '@client/forms'
import { IntlShape } from 'react-intl'
import { configMessage } from '@client/i18n/messages/views/FormConfig'
import { goToFormConfigWizard } from '@client/navigation'

const Title = styled.h1`
  margin-top: 16px;
  margin-bottom: 16px;
  margin-left: 24px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold14}
`

const ListItem = styled.li<{ isSelected: boolean }>`
  ${({ isSelected, theme }) =>
    isSelected ? theme.fonts.bold14 : theme.fonts.reg14};
`

interface IPageNavigation {
  intl: IntlShape
  registerForm: { [key: string]: IForm }
  section?: string
  event?: Event
  goToFormConfigWizard: typeof goToFormConfigWizard
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
    padding: 7px 38px 9px 0px;
    ${({ theme, isSelected }) => isSelected && theme.fonts.bold14};
  }
`

export const PageNavigation = (props: IPageNavigation) => {
  const { event, intl, section, goToFormConfigWizard } = props
  const TAB = event === 'birth' ? TAB_BIRTH : TAB_DEATH

  return (
    <>
      <Title>Pages</Title>
      <ol>
        {Object.keys(TAB).map((tab, idx) => {
          const isSelected = section === TAB[tab as keyof typeof TAB]
          return (
            <ListItem isSelected={isSelected}>
              <PageItems
                key={idx}
                id={`${tab}_navigation`}
                label={`${intl.formatMessage(
                  configMessage[TAB[tab as keyof typeof TAB]]
                )}`}
                isSelected={isSelected}
                onClick={() =>
                  goToFormConfigWizard(event!, TAB[tab as keyof typeof TAB])
                }
              />
            </ListItem>
          )
        })}
      </ol>
    </>
  )
}

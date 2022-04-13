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
import { IntlShape, useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'
import { goToFormConfigWizard } from '@client/navigation'
import { connect } from 'react-redux'

const Title = styled.h1`
  margin-top: 16px;
  margin-bottom: 16px;
  margin-left: 24px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold14}
`

const OrderedList = styled.ol`
  list-style: none;
  padding: 0px;
`

interface IPageNavigationProps {
  section: string
  event: Event
  goToFormConfigWizard: typeof goToFormConfigWizard
}

export const TAB_BIRTH = {
  // introduction: 'introduction',
  child: 'child',
  mother: 'mother',
  father: 'father',
  informant: 'informant',
  documents: 'documents'
}

export const TAB_DEATH = {
  // introduction: 'introduction',
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
    padding: 7px 38px 9px 24px;
    ${({ theme, isSelected }) => isSelected && theme.fonts.bold14};
  }
`

export const PageNavigationView = ({
  event,
  section,
  goToFormConfigWizard
}: IPageNavigationProps) => {
  const intl = useIntl()
  const TAB = event === Event.BIRTH ? TAB_BIRTH : TAB_DEATH

  return (
    <>
      <Title>{intl.formatMessage(messages.pages)}</Title>
      <OrderedList>
        {(Object.keys(TAB) as Array<keyof typeof TAB>).map((tab, idx) => (
          <li>
            <PageItems
              key={idx}
              id={`${tab}_navigation`}
              label={`${idx + 1}. ${intl.formatMessage(messages[TAB[tab]])}`}
              isSelected={section === TAB[tab]}
              onClick={() => goToFormConfigWizard(event, TAB[tab])}
            />
          </li>
        ))}
      </OrderedList>
    </>
  )
}

export const PageNavigation = connect(null, { goToFormConfigWizard })(
  PageNavigationView
)

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
import { Event, BirthSection, DeathSection, WizardSection } from '@client/forms'
import { useIntl } from 'react-intl'
import {
  messages,
  navigationMessages
} from '@client/i18n/messages/views/formConfig'
import { goToFormConfigWizard } from '@client/navigation'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'

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

interface IRouteProps {
  section: WizardSection
  event: Event
}

const PageItems = styled(NavigationSubItem)<{ isSelected: boolean }>`
  ${LabelContainer} {
    padding: 7px 38px 9px 24px;
    ${({ theme, isSelected }) => isSelected && theme.fonts.bold14};
  }
`

export function SectionNavigation() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { event, section } = useParams<IRouteProps>()
  const tabs = event === Event.BIRTH ? BirthSection : DeathSection

  return (
    <>
      <Title>{intl.formatMessage(messages.pages)}</Title>
      <OrderedList>
        {Object.values<BirthSection | DeathSection>(tabs).map((tab, idx) => {
          if (tab === BirthSection.Preview || tab === DeathSection.Preview) {
            return <React.Fragment key={idx}></React.Fragment>
          }
          return (
            <li key={idx}>
              <PageItems
                id={`${tab}_navigation`}
                label={`${idx + 1}. ${intl.formatMessage(
                  navigationMessages[tab]
                )}`}
                isSelected={section === tab}
                onClick={() => dispatch(goToFormConfigWizard(event, tab))}
              />
            </li>
          )
        })}
      </OrderedList>
    </>
  )
}

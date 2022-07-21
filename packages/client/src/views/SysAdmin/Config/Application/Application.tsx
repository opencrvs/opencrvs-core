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
import { useIntl } from 'react-intl'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
import styled from 'styled-components'
import { FormTabs } from '@opencrvs/components/lib/forms'
import { ListViewSimplified } from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import {
  ApplicationName,
  Currency,
  GovtLogo,
  NIDNumPattern,
  PhoneNumPattern
} from '@client/views/SysAdmin/Config/Application/Tabs/GeneralProperties'
import {
  BirthDelayedFee,
  BirthDelayedRegistrationTarget,
  BirthFeeOnTime,
  BirthLateFee,
  BirthLateRegistrationPeriod,
  BirthRegistrationTarget
} from '@client/views/SysAdmin/Config/Application/Tabs/BirthProperties'
import {
  DeathDelayedFee,
  DeathDelayedRegistrationTarget,
  DeathFeeOnTime,
  DeathRegistrationTarget
} from '@client/views/SysAdmin/Config/Application/Tabs/DeathProperties'

const ListGroupTitle = styled.div`
  color: ${({ theme }) => theme.colors.grey400};
  width: 100%;
  height: 56px;
  text-align: left;
  ${({ theme }) => theme.fonts.bold14};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  display: flex;
  align-items: center;
`

export enum TabId {
  GENERAL = 'general',
  BIRTH = 'birth',
  DEATH = 'death'
}

export enum GeneralActionId {
  APPLICATION_NAME = 'APPLICATION_NAME',
  COUNTRY_LOGO = 'COUNTRY_LOGO',
  NID_NUMBER_PATTERN = 'NID_NUMBER_PATTERN',
  CURRENCY = 'CURRENCY',
  PHONE_NUMBER_PATTERN = 'PHONE_NUMBER_PATTERN'
}

export enum BirthActionId {
  BIRTH_REGISTRATION_TARGET = 'BIRTH_REGISTRATION_TARGET',
  BIRTH_LATE_REGISTRATION_TARGET = 'BIRTH_LATE_REGISTRATION_TARGET',
  BIRTH_PERIOD_BETWEEN_LATE_DELAYED_TARGET = 'birthPeriodBetweenLateDelayedTarget',
  BIRTH_ON_TIME_FEE = 'BIRTH_ON_TIME_FEE',
  BIRTH_LATE_FEE = 'BIRTH_LATE_FEE',
  BIRTH_DELAYED_FEE = 'BIRTH_DELAYED_FEE'
}

export enum DeathActionId {
  DEATH_REGISTRATION_TARGET = 'DEATH_REGISTRATION_TARGET',
  DEATH_REGISTRATION_DELAYED_TARGET = 'DEATH_REGISTRATION_DELAYED_TARGET',
  DEATH_ON_TIME_FEE = 'DEATH_ON_TIME_FEE',
  DEATH_DELAYED_FEE = 'DEATH_DELAYED_FEE'
}

interface ISection {
  title: React.ReactNode
}

function GeneralTabContent() {
  return (
    <ListViewSimplified>
      <ApplicationName />
      <GovtLogo />
      <Currency />
      <PhoneNumPattern />
      <NIDNumPattern />
    </ListViewSimplified>
  )
}

function BirthTabContent() {
  const intl = useIntl()
  return (
    <>
      <ListGroupTitle>
        {intl.formatMessage(messages.registrationTimePeriodsGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <BirthRegistrationTarget />
        <BirthLateRegistrationPeriod />
        <BirthDelayedRegistrationTarget />
      </ListViewSimplified>

      <ListGroupTitle>
        {intl.formatMessage(messages.registrationFeesGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <BirthFeeOnTime />
        <BirthLateFee />
        <BirthDelayedFee />
      </ListViewSimplified>
    </>
  )
}

function DeathTabContent() {
  const intl = useIntl()

  return (
    <>
      <ListGroupTitle>
        {intl.formatMessage(messages.registrationTimePeriodsGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <DeathRegistrationTarget />
        <DeathDelayedRegistrationTarget />
      </ListViewSimplified>
      <ListGroupTitle>
        {intl.formatMessage(messages.registrationFeesGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <DeathFeeOnTime />
        <DeathDelayedFee />
      </ListViewSimplified>
    </>
  )
}

export function ApplicationConfig() {
  const intl = useIntl()
  const [activeTabId, setActiveTabId] = React.useState(TabId.GENERAL)

  const tabSections = [
    {
      id: TabId.GENERAL,
      title: intl.formatMessage(messages.generalTabTitle)
    },
    {
      id: TabId.BIRTH,
      title: intl.formatMessage(messages.birthTabTitle)
    },
    {
      id: TabId.DEATH,
      title: intl.formatMessage(messages.deathTabTitle)
    }
  ]

  return (
    <SysAdminContentWrapper
      isCertificatesConfigPage={true}
      hideBackground={true}
    >
      <Content
        title={intl.formatMessage(messages.applicationSettings)}
        titleColor={'copy'}
        tabBarContent={
          <FormTabs
            sections={tabSections}
            activeTabId={activeTabId}
            onTabClick={(id: TabId) => setActiveTabId(id)}
          />
        }
      >
        {activeTabId === TabId.GENERAL && <GeneralTabContent />}
        {activeTabId === TabId.BIRTH && <BirthTabContent />}
        {activeTabId === TabId.DEATH && <DeathTabContent />}
      </Content>
    </SysAdminContentWrapper>
  )
}

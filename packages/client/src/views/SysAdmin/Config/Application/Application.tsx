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
import * as React from 'react'
import { useIntl } from 'react-intl'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import styled from 'styled-components'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { ListViewSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import {
  ApplicationName,
  Currency,
  GovtLogo,
  NIDNumPattern,
  PhoneNumPattern,
  LoginBackground
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
import {
  MarriageDelayedFee,
  MarriageDelayedRegistrationTarget,
  MarriageFeeOnTime,
  MarriageRegistrationTarget
} from '@client/views/SysAdmin/Config/Application/Tabs/MarriageProperties'

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

enum TabId {
  GENERAL = 'general',
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage'
}

export enum GeneralActionId {
  APPLICATION_NAME = 'APPLICATION_NAME',
  COUNTRY_LOGO = 'COUNTRY_LOGO',
  NID_NUMBER_PATTERN = 'NID_NUMBER_PATTERN',
  CURRENCY = 'CURRENCY',
  PHONE_NUMBER_PATTERN = 'PHONE_NUMBER_PATTERN',
  LOGIN_BACKGROUND = 'LOGIN_BACKGROUND'
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

export enum MarriageActionId {
  MARRIAGE_REGISTRATION_TARGET = 'MARRIAGE_REGISTRATION_TARGET',
  MARRIAGE_REGISTRATION_DELAYED_TARGET = 'MARRIAGE_REGISTRATION_DELAYED_TARGET',
  MARRIAGE_ON_TIME_FEE = 'MARRIAGE_ON_TIME_FEE',
  MARRIAGE_DELAYED_FEE = 'MARRIAGE_DELAYED_FEE'
}

function GeneralTabContent() {
  return (
    <ListViewSimplified>
      <ApplicationName />
      <GovtLogo />
      <LoginBackground />
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

function MarriageTabContent() {
  const intl = useIntl()

  return (
    <>
      <ListGroupTitle>
        {intl.formatMessage(messages.registrationTimePeriodsGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <MarriageRegistrationTarget />
        <MarriageDelayedRegistrationTarget />
      </ListViewSimplified>
      <ListGroupTitle>
        {intl.formatMessage(messages.registrationFeesGroupTitle)}
      </ListGroupTitle>
      <ListViewSimplified>
        <MarriageFeeOnTime />
        <MarriageDelayedFee />
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
    },
    {
      id: TabId.MARRIAGE,
      title: intl.formatMessage(messages.marriageTabTitle)
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
        {activeTabId === TabId.MARRIAGE && <MarriageTabContent />}
      </Content>
    </SysAdminContentWrapper>
  )
}

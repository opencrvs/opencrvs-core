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
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { DynamicModal } from './DynamicModal'
import { EMPTY_STRING } from '@client/utils/constants'
import styled from 'styled-components'
import { lookup } from 'country-data'
import { FormattedNumberCurrency } from '@opencrvs/components/lib/symbol'
import { FormTabs } from '@opencrvs/components/lib/forms'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'

import { LinkButton } from '@opencrvs/components/lib/buttons'
import { isString } from 'lodash'
import { CountryLogo } from '@opencrvs/components/lib/icons'

export const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`
export const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

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

interface IItem {
  label: React.ReactNode
  value: React.ReactNode
  action: {
    id: string
    label: string
    handler?: () => void
    disabled?: boolean
  }
}
interface ISection {
  title: React.ReactNode
  items: IItem[]
}

function GeneralTabContent({
  offlineCountryConfiguration,
  intl,
  callBack
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
  callBack: (modalName: string) => void
}) {
  const countryCurrencyName = lookup.currencies({
    code: offlineCountryConfiguration.config.CURRENCY.isoCode
  })

  //TODO: Follow the approach used in FormTools
  const items = [
    {
      label: intl.formatMessage(messages.applicationNameLabel),
      value: offlineCountryConfiguration.config.APPLICATION_NAME,
      action: {
        id: GeneralActionId.APPLICATION_NAME,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          callBack(GeneralActionId.APPLICATION_NAME)
        }
      }
    },
    {
      label: intl.formatMessage(messages.govermentLogoLabel),
      value: (
        <CountryLogo
          src={offlineCountryConfiguration.config.COUNTRY_LOGO.file}
        />
      ),
      action: {
        id: GeneralActionId.COUNTRY_LOGO,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          callBack(GeneralActionId.COUNTRY_LOGO)
        }
      }
    },
    {
      label: intl.formatMessage(messages.currencyLabel),
      value: countryCurrencyName[0].name,
      action: {
        id: GeneralActionId.CURRENCY,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          callBack(GeneralActionId.CURRENCY)
        }
      }
    },
    {
      id: 'phoneNumberPattern_value_container',
      label: intl.formatMessage(messages.phoneNumberLabel),
      value: offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN.toString(),
      action: {
        id: GeneralActionId.PHONE_NUMBER_PATTERN,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          callBack(GeneralActionId.PHONE_NUMBER_PATTERN)
        }
      }
    },
    {
      id: 'nidPattern_value_container',
      label: intl.formatMessage(messages.nidPatternTitle),
      value: offlineCountryConfiguration.config.NID_NUMBER_PATTERN.toString(),
      action: {
        id: GeneralActionId.NID_NUMBER_PATTERN,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          callBack(GeneralActionId.NID_NUMBER_PATTERN)
        }
      }
    }
  ]
  return (
    <ListViewSimplified>
      {items.map((item) => {
        const id = item.id
          ? item.id
          : isString(item.label)
          ? item.label.split(' ').join('-')
          : 'label-component'
        return (
          <ListViewItemSimplified
            key={item.id}
            label={<Label id={`${id}_label`}>{item.label}</Label>}
            value={<Value id={`${id}_value`}>{item.value}</Value>}
            actions={
              <LinkButton id={item.action.id} onClick={item.action.handler}>
                {item.action.label}
              </LinkButton>
            }
          />
        )
      })}
    </ListViewSimplified>
  )
}

function BirthTabContent({
  offlineCountryConfiguration,
  intl,
  callBack
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
  callBack: (modalName: string) => void
}) {
  const sections: ISection[] = [
    {
      title: (
        <ListGroupTitle>
          {intl.formatMessage(messages.registrationTimePeriodsGroupTitle)}
        </ListGroupTitle>
      ),
      items: [
        {
          label: intl.formatMessage(messages.legallySpecifiedLabel),
          value: intl.formatMessage(messages.legallySpecifiedValue, {
            onTime: offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET
          }),
          action: {
            id: BirthActionId.BIRTH_REGISTRATION_TARGET,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(BirthActionId.BIRTH_REGISTRATION_TARGET)
            }
          }
        },
        {
          label: intl.formatMessage(messages.lateRegistrationLabel),
          value: intl.formatMessage(messages.lateRegistrationValue, {
            onTime:
              offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET,
            lateTime:
              offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET
          }),
          action: {
            id: BirthActionId.BIRTH_PERIOD_BETWEEN_LATE_DELAYED_TARGET,
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: intl.formatMessage(messages.delayedRegistrationValue, {
            lateTime:
              offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET
          }),
          action: {
            id: BirthActionId.BIRTH_LATE_REGISTRATION_TARGET,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(BirthActionId.BIRTH_LATE_REGISTRATION_TARGET)
            }
          }
        }
      ]
    },
    {
      title: (
        <ListGroupTitle>
          {intl.formatMessage(messages.registrationFeesGroupTitle)}
        </ListGroupTitle>
      ),
      items: [
        {
          label: intl.formatMessage(messages.withinLegallySpecifiedTimeLabel),
          value: (
            <FormattedNumberCurrency
              value={offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME}
              currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
              languagesAndCountry={
                offlineCountryConfiguration.config.CURRENCY
                  .languagesAndCountry[0]
              }
            />
          ),
          action: {
            id: BirthActionId.BIRTH_ON_TIME_FEE,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(BirthActionId.BIRTH_ON_TIME_FEE)
            }
          }
        },
        {
          label: intl.formatMessage(messages.lateRegistrationLabel),
          value: (
            <FormattedNumberCurrency
              value={offlineCountryConfiguration.config.BIRTH.FEE.LATE}
              currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
              languagesAndCountry={
                offlineCountryConfiguration.config.CURRENCY
                  .languagesAndCountry[0]
              }
            />
          ),
          action: {
            id: BirthActionId.BIRTH_LATE_FEE,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(BirthActionId.BIRTH_LATE_FEE)
            }
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: (
            <FormattedNumberCurrency
              value={offlineCountryConfiguration.config.BIRTH.FEE.DELAYED}
              currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
              languagesAndCountry={
                offlineCountryConfiguration.config.CURRENCY
                  .languagesAndCountry[0]
              }
            />
          ),
          action: {
            id: BirthActionId.BIRTH_DELAYED_FEE,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(BirthActionId.BIRTH_DELAYED_FEE)
            }
          }
        }
      ]
    }
  ]

  return (
    <>
      {sections.map((section, idx) => (
        <>
          {section.title}
          <ListViewSimplified key={idx}>
            {section.items.map((item, index) => {
              const id = isString(item.label)
                ? item.label.split(' ').join('-')
                : 'label-component'
              return (
                <ListViewItemSimplified
                  key={index}
                  label={<Label id={`${id}_label`}>{item.label}</Label>}
                  value={<Value id={`${id}_value`}>{item.value}</Value>}
                  actions={
                    <LinkButton
                      id={item.action.id}
                      disabled={item.action.disabled}
                      onClick={item.action.handler}
                    >
                      {item.action?.label}
                    </LinkButton>
                  }
                />
              )
            })}
          </ListViewSimplified>
        </>
      ))}
    </>
  )
}

function DeathTabContent({
  offlineCountryConfiguration,
  intl,
  callBack
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
  callBack: (modalName: string) => void
}) {
  const sections: ISection[] = [
    {
      title: (
        <ListGroupTitle>
          {intl.formatMessage(messages.registrationTimePeriodsGroupTitle)}
        </ListGroupTitle>
      ),
      items: [
        {
          label: intl.formatMessage(messages.legallySpecifiedLabel),
          value: intl.formatMessage(messages.legallySpecifiedValue, {
            onTime: offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET
          }),
          action: {
            id: DeathActionId.DEATH_REGISTRATION_TARGET,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(DeathActionId.DEATH_REGISTRATION_TARGET)
            }
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: intl.formatMessage(messages.delayedRegistrationValue, {
            lateTime:
              offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET
          }),
          action: {
            id: DeathActionId.DEATH_REGISTRATION_DELAYED_TARGET,
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        }
      ]
    },
    {
      title: (
        <ListGroupTitle>
          {intl.formatMessage(messages.registrationFeesGroupTitle)}
        </ListGroupTitle>
      ),
      items: [
        {
          label: intl.formatMessage(messages.withinLegallySpecifiedTimeLabel),
          value: (
            <FormattedNumberCurrency
              value={offlineCountryConfiguration.config.DEATH.FEE.ON_TIME}
              currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
              languagesAndCountry={
                offlineCountryConfiguration.config.CURRENCY
                  .languagesAndCountry[0]
              }
            />
          ),
          action: {
            id: DeathActionId.DEATH_ON_TIME_FEE,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(DeathActionId.DEATH_ON_TIME_FEE)
            }
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: (
            <FormattedNumberCurrency
              value={offlineCountryConfiguration.config.DEATH.FEE.DELAYED}
              currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
              languagesAndCountry={
                offlineCountryConfiguration.config.CURRENCY
                  .languagesAndCountry[0]
              }
            />
          ),
          action: {
            id: DeathActionId.DEATH_DELAYED_FEE,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(DeathActionId.DEATH_DELAYED_FEE)
            }
          }
        }
      ]
    }
  ]

  return (
    <>
      {sections.map((section, idx) => (
        <>
          {section.title}
          <ListViewSimplified key={idx}>
            {section.items.map((item, index) => {
              const id = isString(item.label)
                ? item.label.split(' ').join('-')
                : 'label-component'

              return (
                <ListViewItemSimplified
                  key={index}
                  label={<Label id={`${id}_label`}>{item.label}</Label>}
                  value={<Value id={`${id}_value`}>{item.value}</Value>}
                  actions={
                    <LinkButton
                      id={item.action.id}
                      onClick={item.action.handler}
                      disabled={item.action.disabled}
                    >
                      {item.action.label}
                    </LinkButton>
                  }
                />
              )
            })}
          </ListViewSimplified>
        </>
      ))}
    </>
  )
}

function ApplicationConfigComponent() {
  const intl = useIntl()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [activeTabId, setActiveTabId] = React.useState(TabId.GENERAL)
  const [changeModalName, setModalName] = React.useState(EMPTY_STRING)
  const [showNotification, setShowNotification] = React.useState(false)
  const [notificationStatus, setNotificationStatus] = React.useState(
    NOTIFICATION_TYPE.IN_PROGRESS
  )
  const [notificationMessages, setNotificationMessages] =
    React.useState(EMPTY_STRING)

  const changeValue = (
    notificationStatus: NOTIFICATION_TYPE,
    messages: string
  ) => {
    if (notificationStatus !== NOTIFICATION_TYPE.ERROR) {
      toggleConfigModal()
      setShowNotification(true)
      setNotificationStatus(notificationStatus)
      setNotificationMessages(messages)
    }
  }

  const changeTab = (id: TabId) => {
    setActiveTabId(id)
  }

  const toggleConfigModal = () => {
    if (changeModalName) {
      setModalName(EMPTY_STRING)
    }
  }

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
            onTabClick={(id: TabId) => changeTab(id)}
          />
        }
      >
        {activeTabId === TabId.GENERAL && (
          <GeneralTabContent
            offlineCountryConfiguration={offlineCountryConfiguration}
            intl={intl}
            callBack={(modalName: string) => setModalName(modalName)}
          />
        )}
        {activeTabId === TabId.BIRTH && (
          <BirthTabContent
            offlineCountryConfiguration={offlineCountryConfiguration}
            intl={intl}
            callBack={(modalName: string) => setModalName(modalName)}
          />
        )}
        {activeTabId === TabId.DEATH && (
          <DeathTabContent
            offlineCountryConfiguration={offlineCountryConfiguration}
            intl={intl}
            callBack={(modalName: string) => setModalName(modalName)}
          />
        )}
      </Content>
      {changeModalName && (
        <DynamicModal
          toggleConfigModal={toggleConfigModal}
          changeModalName={changeModalName}
          showNotification={showNotification}
          valueChanged={changeValue}
        />
      )}
      <FloatingNotification
        id="print-cert-notification"
        type={notificationStatus}
        show={showNotification}
        callback={() => {
          setShowNotification(false)
        }}
      >
        {notificationMessages}
      </FloatingNotification>
    </SysAdminContentWrapper>
  )
}

export const ApplicationConfig = ApplicationConfigComponent

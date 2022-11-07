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

import React, { useState } from 'react'
import { connect } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, FormTabs, Text } from '@client/../../components/lib'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Icon } from '@opencrvs/components/lib/Icon'
import { advancedSearchBirthSectionFormType } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { PrimaryButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'

export enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

const BirthTabContent = () => {
  return <BirthSection />
}

const DeathTabContent = () => {
  return <>Death</>
}

export interface IAdvancedSearch {
  event?: Event
  registrationStatuses?: string[]
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  contactNumber?: string
  nationalId?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: string
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: string
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  deceasedIdentifier?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherDoBStart?: string
  motherDoBEnd?: string
  motherIdentifier?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: string
  fatherDoBStart?: string
  fatherDoBEnd?: string
  fatherIdentifier?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: string
  informantDoBStart?: string
  informantDoBEnd?: string
  informantIdentifier?: string
}

const BirthSection = () => {
  const intl = useIntl()
  const [isDisable, setDisable] = useState(true)
  const isOnline = useOnlineStatus()

  const validateForm = (advancedSearch: IAdvancedSearch) => {
    let count = 0
    for (const field of Object.values(advancedSearch)) {
      const result = field.nestedFields
      for (const value of Object.values(result)) {
        if (value !== '') {
          count++
        }
      }
    }

    if (count > 1 && isOnline) {
      setDisable(false)
    } else {
      setDisable(true)
    }
  }

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <FormFieldGenerator
        id={advancedSearchBirthSectionFormType.id}
        onChange={(values) => {
          validateForm(values)
        }}
        setAllFieldsDirty={false}
        fields={advancedSearchBirthSectionFormType.fields}
      />

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisable}
      >
        {intl.formatMessage(buttonMessages.search)}
      </PrimaryButton>
    </>
  )
}

const AdvancedSearch = () => {
  const intl = useIntl()
  const [activeTabId, setActiveTabId] = useState(TabId.BIRTH)

  const tabSections = [
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
    <>
      <SysAdminContentWrapper
        isCertificatesConfigPage={true}
        hideBackground={true}
      >
        <Content
          title={intl.formatMessage(messages.advancedSearch)}
          titleColor={'copy'}
          tabBarContent={
            <FormTabs
              sections={tabSections}
              activeTabId={activeTabId}
              onTabClick={(id: TabId) => setActiveTabId(id)}
            />
          }
        >
          {activeTabId === TabId.BIRTH && <BirthTabContent />}
          {activeTabId === TabId.DEATH && <DeathTabContent />}
        </Content>
      </SysAdminContentWrapper>
    </>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state)
  }
}

export const AdvancedSearchConfig = connect(mapStateToProps)(
  injectIntl(AdvancedSearch)
)

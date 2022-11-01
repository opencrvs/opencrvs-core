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
import { connect } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, FormTabs, Text } from '@client/../../components/lib'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Icon } from '@opencrvs/components/lib/Icon'
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import { advancedSearchBirthSectionFormType } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { PrimaryButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { IOfflineData } from '@client/offline/reducer'

export enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

type IProps = {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
  offlineCountryConfig: IOfflineData
}

const BirthTabContent = () => {
  return <BirthSection />
}

const BirthSection = () => {
  const intl = useIntl()
  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <FormFieldGenerator
        id={'o'}
        onChange={(values) => {
          //  modifyDeclaration(values, section, declaration)
        }}
        setAllFieldsDirty={false}
        fields={advancedSearchBirthSectionFormType.fields}
      />

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        // onClick={}
      >
        {intl.formatMessage(buttonMessages.search)}
      </PrimaryButton>
    </>
  )
}

const DeathTabContent = () => {
  return <>Death</>
}

const AdvancedSearch = () => {
  const intl = useIntl()
  const [activeTabId, setActiveTabId] = React.useState(TabId.BIRTH)

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

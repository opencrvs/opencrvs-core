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
import { connect, useDispatch, useSelector } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, FormTabs, Text } from '@client/../../components/lib'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Icon } from '@opencrvs/components/lib/Icon'
import { advancedSearchBirthSections } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { advancedSearchDeathSections } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { ICON_ALIGNMENT, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { messages as advancedSearchFormMessages } from '@client/i18n/messages/views/advancedSearchForm'
import { getAdvancedSearchParamsState as AdvancedSearchParamsSelector } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { goToAdvancedSearchResult } from '@client/navigation'
import { pick } from 'lodash'
import { IDateRangePickerValue } from '@client/forms'
import { getOfflineData } from '@client/offline/selectors'
import { Accordion } from '@client/../../components/lib/Accordion'
import { LocationType } from '@client/utils/gateway'
import {
  getAccordionActiveStateMap,
  IBaseAdvancedSearchState,
  isValidDateRangePickerValue,
  transformAdvancedSearchLocalStateToStoreData,
  transformStoreDataToAdvancedSearchLocalState
} from '@client/search/advancedSearch/utils'
import styled from 'styled-components'

export enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

const StyledPrimaryButton = styled(PrimaryButton)`
  margin-top: 32px;
`

const {
  birthSearchRegistrationSection,
  birthSearchChildSection,
  birthSearchMotherSection,
  birthSearchFatherSection,
  birthSearchEventSection,
  birthSearchInformantSection
} = advancedSearchBirthSections
const {
  deathSearchRegistrationSection,
  deathSearchDeceasedSection,
  deathSearchEventSection,
  deathSearchInformantSection
} = advancedSearchDeathSections

const dateFieldTypes = [
  'dateOfRegistration',
  'dateOfEvent',
  'childDoB',
  'motherDoB',
  'fatherDoB',
  'deceasedDoB',
  'informantDoB'
]

export const isAdvancedSearchFormValid = (value: IBaseAdvancedSearchState) => {
  const validNonDateFields = Object.keys(value).filter(
    (key) =>
      !['event', 'eventLocationType'].includes(key) &&
      !dateFieldTypes.includes(key) &&
      Boolean(value[key as keyof IBaseAdvancedSearchState])
  )
  //handle date fields separately
  const validDateFields = dateFieldTypes.filter(
    (key) =>
      value[key as keyof IBaseAdvancedSearchState] &&
      isValidDateRangePickerValue(
        value[key as keyof IBaseAdvancedSearchState] as IDateRangePickerValue
      )
  )

  const validCount = validNonDateFields.length + validDateFields.length
  return validCount >= 2
}

const BirthSection = () => {
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IBaseAdvancedSearchState>({
    ...transformStoreDataToAdvancedSearchLocalState(
      advancedSearchParamsState,
      offlineData,
      'birth'
    )
  })

  const [accordionActiveStateMap, setAccordionActiveStateMap] = useState(
    getAccordionActiveStateMap(advancedSearchParamsState)
  )

  const isDisabled = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()

  const accordionShowingLabel = intl.formatMessage(
    advancedSearchFormMessages.show
  )
  const accordionHidingLabel = intl.formatMessage(
    advancedSearchFormMessages.hide
  )

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <Accordion
        name={birthSearchRegistrationSection.id}
        label={intl.formatMessage(
          advancedSearchFormMessages.registrationDetails
        )}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchRegistrationSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchRegistrationSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchRegistrationSection.fields}
          initialValues={pick(formState, [
            'placeOfRegistration',
            'dateOfRegistration',
            'registrationStatuses'
          ])}
        />
      </Accordion>

      <Accordion
        name={birthSearchChildSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.childDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchChildSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchChildSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchChildSection.fields}
          initialValues={pick(formState, [
            'childDoB',
            'childFirstNames',
            'childLastName',
            'childGender'
          ])}
        />
      </Accordion>

      <Accordion
        name={birthSearchEventSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.eventDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchEventSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchEventSection.id}
          onChange={(values) => {
            const nextVal =
              values.eventLocationType === LocationType.HealthFacility
                ? {
                    ...values,
                    eventCountry: '',
                    eventLocationLevel1: '',
                    eventLocationLevel2: ''
                  }
                : {
                    ...values,
                    eventLocationId: ''
                  }
            setFormState({ ...formState, ...nextVal })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchEventSection.fields}
          initialValues={pick(formState, [
            'eventLocationType',
            'eventLocationId',
            'eventCountry',
            'eventLocationLevel1',
            'eventLocationLevel2'
          ])}
        />
      </Accordion>

      <Accordion
        name={birthSearchMotherSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.motherDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchMotherSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchMotherSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchMotherSection.fields}
          initialValues={pick(formState, [
            'motherDoB',
            'motherFirstNames',
            'motherFamilyName'
          ])}
        />
      </Accordion>

      <Accordion
        name={birthSearchFatherSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.fatherDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchFatherSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchFatherSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchFatherSection.fields}
          initialValues={pick(formState, [
            'fatherDoB',
            'fatherFirstNames',
            'fatherFamilyName'
          ])}
        />
      </Accordion>

      <Accordion
        name={birthSearchInformantSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.informantDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[birthSearchInformantSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchInformantSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchInformantSection.fields}
          initialValues={pick(formState, [
            'informantDoB',
            'informantFirstNames',
            'informantFamilyName'
          ])}
        />
      </Accordion>

      <StyledPrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisabled}
        onClick={() => {
          dispatch(
            setAdvancedSearchParam({
              ...transformAdvancedSearchLocalStateToStoreData(
                formState,
                offlineData
              ),
              event: 'birth'
            })
          )
          dispatch(goToAdvancedSearchResult())
        }}
      >
        {intl.formatMessage(buttonMessages.search)}
      </StyledPrimaryButton>
    </>
  )
}

const DeathSection = () => {
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IBaseAdvancedSearchState>({
    ...transformStoreDataToAdvancedSearchLocalState(
      advancedSearchParamsState,
      offlineData,
      'death'
    )
  })
  const [accordionActiveStateMap, setAccordionActiveStateMap] = useState(
    getAccordionActiveStateMap(advancedSearchParamsState)
  )

  const isDisable = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()
  const accordionShowingLabel = intl.formatMessage(
    advancedSearchFormMessages.show
  )
  const accordionHidingLabel = intl.formatMessage(
    advancedSearchFormMessages.hide
  )

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <Accordion
        name={birthSearchRegistrationSection.id}
        label={intl.formatMessage(
          advancedSearchFormMessages.registrationDetails
        )}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[deathSearchRegistrationSection.id]}
      >
        <FormFieldGenerator
          id={birthSearchRegistrationSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={birthSearchRegistrationSection.fields}
          initialValues={pick(formState, [
            'placeOfRegistration',
            'dateOfRegistration',
            'registrationStatuses'
          ])}
        />
      </Accordion>

      <Accordion
        name={deathSearchDeceasedSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.deceasedDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[deathSearchDeceasedSection.id]}
      >
        <FormFieldGenerator
          id={deathSearchDeceasedSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={deathSearchDeceasedSection.fields}
          initialValues={pick(formState, [
            'deceasedDoB',
            'deceasedFirstNames',
            'deceasedFamilyName',
            'deceasedGender',
            'placeOfDeath'
          ])}
        />
      </Accordion>

      <Accordion
        name={deathSearchEventSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.eventDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[deathSearchEventSection.id]}
      >
        <FormFieldGenerator
          id={deathSearchEventSection.id}
          onChange={(values) => {
            const nextVal =
              values.eventLocationType === LocationType.HealthFacility
                ? {
                    ...values,
                    eventCountry: '',
                    eventLocationLevel1: '',
                    eventLocationLevel2: ''
                  }
                : {
                    ...values,
                    eventLocationId: ''
                  }
            setFormState({ ...formState, ...nextVal })
          }}
          setAllFieldsDirty={false}
          fields={deathSearchEventSection.fields}
          initialValues={pick(formState, [
            'eventLocationType',
            'eventLocationId',
            'eventCountry',
            'eventLocationLevel1',
            'eventLocationLevel2'
          ])}
        />
      </Accordion>

      <Accordion
        name={deathSearchInformantSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.informantDetails)}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[deathSearchInformantSection.id]}
      >
        <FormFieldGenerator
          id={deathSearchInformantSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={deathSearchInformantSection.fields}
          initialValues={pick(formState, [
            'informantDoB',
            'informantFirstNames',
            'informantFamilyName'
          ])}
        />
      </Accordion>

      <StyledPrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisable}
        onClick={() => {
          dispatch(
            setAdvancedSearchParam({
              ...transformAdvancedSearchLocalStateToStoreData(
                formState,
                offlineData
              ),
              event: 'death'
            })
          )
          dispatch(goToAdvancedSearchResult())
        }}
      >
        {intl.formatMessage(buttonMessages.search)}
      </StyledPrimaryButton>
    </>
  )
}

const AdvancedSearch = () => {
  const intl = useIntl()
  const advancedSearchParamState = useSelector(AdvancedSearchParamsSelector)
  const activeTabId = advancedSearchParamState.event || TabId.BIRTH
  const dispatch = useDispatch()

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
              onTabClick={(id: TabId) => {
                dispatch(
                  setAdvancedSearchParam({
                    ...advancedSearchParamState,
                    event: id
                  })
                )
              }}
            />
          }
        >
          {activeTabId === TabId.BIRTH && <BirthSection />}
          {activeTabId === TabId.DEATH && <DeathSection />}
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

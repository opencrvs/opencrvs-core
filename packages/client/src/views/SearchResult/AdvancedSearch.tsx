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

import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, ContentSize, ErrorText, FormTabs } from '@opencrvs/components'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { advancedSearchBirthSections } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { advancedSearchDeathSections } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { buttonMessages } from '@client/i18n/messages'
import { messages as advancedSearchFormMessages } from '@client/i18n/messages/views/advancedSearchForm'
import { getAdvancedSearchParamsState as AdvancedSearchParamsSelector } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { goToAdvancedSearchResult } from '@client/navigation'
import { pick } from 'lodash'
import { IDateRangePickerValue, IFormSectionData } from '@client/forms'
import { getOfflineData } from '@client/offline/selectors'
import { Accordion } from '@client/../../components/lib/Accordion'
import {
  dateFieldTypes,
  getAccordionActiveStateMap,
  IAdvancedSearchFormState,
  isValidDateRangePickerValue,
  transformAdvancedSearchLocalStateToStoreData,
  transformStoreDataToAdvancedSearchLocalState
} from '@client/search/advancedSearch/utils'
import styled from 'styled-components'
import { advancedSearchInitialState } from '@client/search/advancedSearch/reducer'

enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

const SearchButton = styled(Button)`
  margin-top: 32px;
`

const ErrorTextWrapper = styled.div`
  padding-top: 20px;
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

export const isAdvancedSearchFormValid = (value: IAdvancedSearchFormState) => {
  const validNonDateFields = Object.keys(value).filter(
    (key) =>
      !['event', 'eventLocationType'].includes(key) &&
      !dateFieldTypes.includes(key) &&
      Boolean(value[key as keyof IAdvancedSearchFormState])
  )
  //handle date fields separately
  const validationResultsPerDateField: boolean[] = []

  for (const key of dateFieldTypes) {
    const dateObj = value[
      key as keyof IAdvancedSearchFormState
    ] as IDateRangePickerValue

    if (!dateObj) continue

    if (isValidDateRangePickerValue(dateObj)) {
      validationResultsPerDateField.push(true)
      continue
    }
    /*
     * if isValidDateRangePickerValue couldn't validate dateObj
     * the date field would have an invalid value
     */
    if (dateObj.exact) validationResultsPerDateField.push(false)
  }

  const validCount =
    validNonDateFields.length +
    validationResultsPerDateField.filter((valid) => valid).length

  return validCount >= 2 ? true : false
}

const BirthSection = () => {
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IAdvancedSearchFormState>({
    ...transformStoreDataToAdvancedSearchLocalState(
      advancedSearchParamsState,
      offlineData,
      'birth'
    )
  })
  const [accordionActiveStateMap] = useState(
    getAccordionActiveStateMap(advancedSearchParamsState)
  )
  const [showWarningMessage, setShowWarningMessage] = useState(false)

  const isDisabled = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()

  const accordionShowingLabel = intl.formatMessage(
    advancedSearchFormMessages.show
  )
  const accordionHidingLabel = intl.formatMessage(
    advancedSearchFormMessages.hide
  )

  useEffect(() => {
    if (showWarningMessage) {
      // only when it has set the error message once
      setShowWarningMessage(isAdvancedSearchFormValid(formState) ? false : true)
    }
  }, [formState, showWarningMessage])

  return (
    <>
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
              values.eventLocationType === 'HEALTH_FACILITY'
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
        />
      </Accordion>

      {showWarningMessage && (
        <ErrorTextWrapper>
          <ErrorText>You must select a minimum of 2 search criteria.</ErrorText>
        </ErrorTextWrapper>
      )}

      <SearchButton
        id="search"
        key="search"
        type="primary"
        fullWidth
        size="large"
        disabled={false}
        onClick={() => {
          if (isDisabled) {
            setShowWarningMessage(true)
          } else {
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
          }
        }}
      >
        {' '}
        <Icon name={'MagnifyingGlass'} />
        {intl.formatMessage(buttonMessages.search)}
      </SearchButton>
    </>
  )
}

const DeathSection = () => {
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IAdvancedSearchFormState>({
    ...transformStoreDataToAdvancedSearchLocalState(
      advancedSearchParamsState,
      offlineData,
      'death'
    )
  })
  const [accordionActiveStateMap] = useState(
    getAccordionActiveStateMap(advancedSearchParamsState)
  )

  const [showWarningMessage, setShowWarningMessage] = useState(false)

  const isDisable = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()
  const accordionShowingLabel = intl.formatMessage(
    advancedSearchFormMessages.show
  )
  const accordionHidingLabel = intl.formatMessage(
    advancedSearchFormMessages.hide
  )

  useEffect(() => {
    if (showWarningMessage) {
      // only when it has set the error message once
      setShowWarningMessage(isAdvancedSearchFormValid(formState) ? false : true)
    }
  }, [formState, showWarningMessage])

  return (
    <>
      <Accordion
        name={deathSearchRegistrationSection.id}
        label={intl.formatMessage(
          advancedSearchFormMessages.registrationDetails
        )}
        labelForShowAction={accordionShowingLabel}
        labelForHideAction={accordionHidingLabel}
        expand={accordionActiveStateMap[deathSearchRegistrationSection.id]}
      >
        <FormFieldGenerator
          id={deathSearchRegistrationSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={deathSearchRegistrationSection.fields}
          initialValues={pick(formState, [
            'placeOfRegistration',
            'dateOfRegistration',
            'registrationStatuses'
          ])}
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
            'deceasedGender'
          ])}
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
              values.eventLocationType === 'HEALTH_FACILITY'
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
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
          draftData={{ advancedSearchForm: formState as IFormSectionData }}
        />
      </Accordion>

      {showWarningMessage && (
        <ErrorTextWrapper>
          <ErrorText>You must select a minimum of 2 search criteria.</ErrorText>
        </ErrorTextWrapper>
      )}

      <SearchButton
        id="search"
        key="search"
        type="primary"
        size="large"
        fullWidth
        disabled={false}
        onClick={() => {
          if (isDisable) {
            setShowWarningMessage(true)
          } else {
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
          }
        }}
      >
        {' '}
        <Icon name={'MagnifyingGlass'} />
        {intl.formatMessage(buttonMessages.search)}
      </SearchButton>
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
          size={ContentSize.SMALL}
          tabBarContent={
            <FormTabs
              sections={tabSections}
              activeTabId={activeTabId}
              onTabClick={(id: TabId) => {
                dispatch(
                  setAdvancedSearchParam({
                    ...advancedSearchInitialState,
                    event: id
                  })
                )
              }}
            />
          }
          subtitle={intl.formatMessage(messages.advancedSearchInstruction)}
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

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
import {
  IFormData,
  IFormSectionGroup,
  IRadioGroupWithNestedFieldsFormField,
  ISelectOption
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import { dynamicMessages } from '@client/i18n/messages/views/certificate'
import { getAvailableLanguages } from '@client/i18n/utils'
import { ILanguageState } from '@client/i18n/reducer'
import { IPrintableDeclaration } from '@client/declarations'
import { IntlShape } from 'react-intl'
import { IOfflineData } from '@client/offline/reducer'
import differenceInDays from 'date-fns/differenceInDays'

const MONTH_IN_DAYS = 30
const YEAR_IN_DAYS = 365

interface IRange {
  start: number
  end?: number
  value: number
}

export interface ICountry {
  value: string
  name: string
}

export interface IAvailableCountries {
  language?: string
  countries?: ICountry[]
}

export function getCountryTranslations(
  languageState: ILanguageState,
  countries: ISelectOption[]
): IAvailableCountries[] {
  const certificateCountries: IAvailableCountries[] = []
  getAvailableLanguages().forEach((language: string) => {
    const certificateCountry: IAvailableCountries = { language }
    const availableCountries: ICountry[] = []
    countries.forEach((country) => {
      availableCountries.push({
        value: country.value,
        name: languageState[language].messages[`countries.${country.value}`]
      })
    })
    certificateCountry.countries = availableCountries
    certificateCountries.push(certificateCountry)
  })
  return certificateCountries
}

interface IDayRange {
  rangeData: { [key in Event]?: IRange[] }
}

function getDayRanges(offlineData: IOfflineData): IDayRange {
  const BIRTH_REGISTRATION_TARGET = offlineData.config.BIRTH.REGISTRATION_TARGET
  const BIRTH_LATE_REGISTRATION_TARGET =
    offlineData.config.BIRTH.LATE_REGISTRATION_TARGET
  const BIRTH_ON_TIME_FEE = offlineData.config.BIRTH.FEE.ON_TIME
  const BIRTH_LATE_FEE = offlineData.config.BIRTH.FEE.LATE
  const BIRTH_DELAYED_FEE = offlineData.config.BIRTH.FEE.DELAYED

  const DEATH_REGISTRATION_TARGET = offlineData.config.DEATH.REGISTRATION_TARGET
  const DEATH_ON_TIME_FEE = offlineData.config.DEATH.FEE.ON_TIME
  const DEATH_DELAYED_FEE = offlineData.config.DEATH.FEE.DELAYED

  const MARRIAGE_REGISTRATION_TARGET =
    offlineData.config.MARRIAGE.REGISTRATION_TARGET
  const MARRIAGE_ON_TIME_FEE = offlineData.config.MARRIAGE.FEE.ON_TIME
  const MARRIAGE_DELAYED_FEE = offlineData.config.MARRIAGE.FEE.DELAYED

  const birthRanges = [
    { start: 0, end: BIRTH_REGISTRATION_TARGET, value: BIRTH_ON_TIME_FEE },
    {
      start: BIRTH_REGISTRATION_TARGET + 1,
      end: BIRTH_LATE_REGISTRATION_TARGET,
      value: BIRTH_LATE_FEE
    },
    { start: BIRTH_LATE_REGISTRATION_TARGET + 1, value: BIRTH_DELAYED_FEE }
  ]

  const deathRanges = [
    { start: 0, end: DEATH_REGISTRATION_TARGET, value: DEATH_ON_TIME_FEE },
    { start: DEATH_REGISTRATION_TARGET + 1, value: DEATH_DELAYED_FEE }
  ]

  const marriageRanges = [
    {
      start: 0,
      end: MARRIAGE_REGISTRATION_TARGET,
      value: MARRIAGE_ON_TIME_FEE
    },
    { start: MARRIAGE_REGISTRATION_TARGET + 1, value: MARRIAGE_DELAYED_FEE }
  ]

  return {
    rangeData: {
      [Event.Birth]: birthRanges,
      [Event.Death]: deathRanges,
      [Event.Marriage]: marriageRanges
    }
  }
}

function getValue(
  offlineData: IOfflineData,
  event: Event,
  check: number
): IRange['value'] {
  const rangeByEvent = getDayRanges(offlineData).rangeData[event] as IRange[]
  const foundRange = rangeByEvent.find((range) =>
    range.end
      ? check >= range.start && check <= range.end
      : check >= range.start
  )
  return foundRange ? foundRange.value : rangeByEvent[0].value
}

export function calculateDaysFromToday(doE: string) {
  const todaysDate = new Date(Date.now())
  const eventDate = new Date(doE)
  const diffInDays = differenceInDays(todaysDate, eventDate)
  return diffInDays
}

function calculateDays(doE: string, regDate: string) {
  const registeredDate = new Date(regDate)
  const eventDate = new Date(doE)
  const diffInDays = differenceInDays(registeredDate, eventDate)
  return diffInDays
}

export function timeElapsed(days: number) {
  const output: { unit: string; value: number } = { value: 0, unit: 'Day' }

  const year = Math.floor(days / YEAR_IN_DAYS)
  const month = Math.floor(days / MONTH_IN_DAYS)

  if (year > 0) {
    output.value = year
    output.unit = 'Year'
  } else if (month > 0) {
    output.value = month
    output.unit = 'Month'
  } else {
    output.value = days
  }

  return output
}

export function calculatePrice(
  event: Event,
  eventDate: string,
  registeredDate: string,
  offlineData: IOfflineData
) {
  const days = calculateDays(eventDate, registeredDate)
  const result = getValue(offlineData, event, days)
  return result
}

export function getServiceMessage(
  intl: IntlShape,
  event: Event,
  eventDate: string,
  registeredDate: string,
  offlineData: IOfflineData
) {
  const days = calculateDays(eventDate, registeredDate)

  if (event === Event.Birth) {
    if (days <= offlineData.config.BIRTH.REGISTRATION_TARGET) {
      return intl.formatMessage(dynamicMessages[`${event}ServiceBefore`], {
        target: offlineData.config.BIRTH.REGISTRATION_TARGET
      })
    } else if (
      days > offlineData.config.BIRTH.REGISTRATION_TARGET &&
      days <= offlineData.config.BIRTH.LATE_REGISTRATION_TARGET
    ) {
      return intl.formatMessage(dynamicMessages[`${event}ServiceBetween`], {
        target: offlineData.config.BIRTH.REGISTRATION_TARGET,
        latetarget: offlineData.config.BIRTH.LATE_REGISTRATION_TARGET
      })
    } else {
      return intl.formatMessage(dynamicMessages[`${event}ServiceAfter`], {
        target: offlineData.config.BIRTH.LATE_REGISTRATION_TARGET
      })
    }
  } else if (event === Event.Death) {
    if (days <= offlineData.config.DEATH.REGISTRATION_TARGET) {
      return intl.formatMessage(dynamicMessages[`${event}ServiceBefore`], {
        target: offlineData.config.DEATH.REGISTRATION_TARGET
      })
    } else {
      return intl.formatMessage(dynamicMessages[`${event}ServiceAfter`], {
        target: offlineData.config.DEATH.REGISTRATION_TARGET
      })
    }
  } else if (event === Event.Marriage) {
    if (days <= offlineData.config.DEATH.REGISTRATION_TARGET) {
      return intl.formatMessage(dynamicMessages[`${event}ServiceBefore`], {
        target: offlineData.config.MARRIAGE.REGISTRATION_TARGET
      })
    } else {
      return intl.formatMessage(dynamicMessages[`${event}ServiceAfter`], {
        target: offlineData.config.MARRIAGE.REGISTRATION_TARGET
      })
    }
  }
}

export function isFreeOfCost(
  event: Event,
  eventDate: string,
  registeredDate: string,
  offlineData: IOfflineData
): boolean {
  const days = calculateDays(eventDate, registeredDate)
  const result = getValue(offlineData, event, days)
  return result === 0
}

export function getEventDate(data: IFormData, event: Event) {
  switch (event) {
    case Event.Birth:
      return data.child.childBirthDate as string
    case Event.Death:
      return data.deathEvent.deathDate as string
    case Event.Marriage:
      return data.marriageEvent.marriageDate as string
  }
}

export function getRegisteredDate(data: IFormData) {
  const historyList = data.history as unknown as { [key: string]: any }[]
  const regHistory = historyList.find(
    (history) => history.regStatus === 'REGISTERED'
  )
  return regHistory && regHistory.date
}

export function getEvent(eventType: string | undefined) {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.Birth
    case 'death':
      return Event.Death
    case 'marriage':
      return Event.Marriage
  }
}

export function isCertificateForPrintInAdvance(
  declaration: IPrintableDeclaration | undefined
) {
  const collectorType =
    declaration?.data?.registration?.certificates?.[0]?.collector?.type
  if (collectorType && collectorType === 'PRINT_IN_ADVANCE') {
    return true
  }
  return false
}

export function getRegistrarSignatureHandlebarName(
  offlineCountryConfig: IOfflineData,
  event: Event
) {
  const svgCode =
    offlineCountryConfig.templates.certificates![event]?.definition
  const html = document.createElement('html')
  html.innerHTML = String(svgCode)
  const certificateImages = html.querySelectorAll('image')
  const signatureImage = Array.from(certificateImages).find(
    (image) => image.getAttribute('data-content') === 'signature'
  )
  const handlebarText =
    signatureImage?.getAttribute('href') ||
    signatureImage?.getAttribute('xlink:href') ||
    ''
  return handlebarText?.match(/^{{(\w+)}}$/)?.[1] || ''
}

export function filterPrintInAdvancedOption(collectionForm: IFormSectionGroup) {
  const filtredCollectionForm = collectionForm.fields.map((field) => {
    if (field.type !== 'RADIO_GROUP') return field

    const filteredOption = field.options.filter(
      (option) => option.value !== 'PRINT_IN_ADVANCE'
    )
    return { ...field, options: filteredOption }
  })

  return { ...collectionForm, fields: filtredCollectionForm }
}

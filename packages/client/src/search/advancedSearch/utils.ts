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
import { IDateRangePickerValue } from '@client/forms'

export interface IAdvancedSearchFormState {
  event?: string
  registrationStatuses?: string
  dateOfEvent?: IDateRangePickerValue
  dateOfEventStart?: string
  dateOfEventEnd?: string
  registrationByPeriod?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: IDateRangePickerValue
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  placeOfRegistration?: string
  eventLocationType?: string
  eventCountry?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
  eventLocationLevel6?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: IDateRangePickerValue
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: IDateRangePickerValue
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: IDateRangePickerValue
  motherDoBStart?: string
  motherDoBEnd?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: IDateRangePickerValue
  fatherDoBStart?: string
  fatherDoBEnd?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: IDateRangePickerValue
  informantDoBStart?: string
  informantDoBEnd?: string
}

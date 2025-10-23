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
import { FieldConfig, FieldType } from '@opencrvs/commons/client'

import { Address } from './Address'
import { AdministrativeArea } from './AdministrativeArea'
import { BulletList } from './BulletList'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { DateField } from './DateField'
import { Divider } from './Divider'
import { Http } from './Http'
import { LocationSearch } from './LocationSearch'
import { Name } from './Name'
import { Number } from './Number'
import { PageHeader } from './PageHeader'
import { AgeField } from './AgeField'
import { Paragraph } from './Paragraph'
import { RadioGroup } from './RadioGroup'
import { RegisteredFieldModule } from './RegisteredField'
import { Select } from './Select'
import { SelectCountry } from './SelectCountry'
import { SelectDateRangeField } from './SelectDateRangeField'
import { Text } from './Text'
import { TimeField } from './TimeField'
import { AlphaPrintButton } from './AlphaPrintButton'
import { LinkButton } from './LinkButton'
import { VerificationStatus } from './VerificationStatus'
import { QueryParamReader } from './QueryParamReader'

export * from './Address'
export * from './AdministrativeArea'
export * from './AgeField'
export * from './BulletList'
export * from './Button'
export * from './Checkbox'
export * from './DateField'
export * from './Divider'
export * from './Http'
export * from './LocationSearch'
export * from './Name'
export * from './Number'
export * from './PageHeader'
export * from './Paragraph'
export * from './RadioGroup'
export * from './Select'
export * from './SelectCountry'
export * from './SelectDateRangeField'
export * from './Text'
export * from './TimeField'
export * from './AlphaPrintButton'
export * from './LinkButton'
export * from './VerificationStatus'

export function getRegisteredFieldByFieldConfig<T extends FieldConfig>(
  type: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): RegisteredFieldModule<any> | undefined {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (type.type) {
    case FieldType.ADDRESS:
      return Address
    case FieldType.BULLET_LIST:
      return BulletList
    case FieldType.BUTTON:
      return Button
    case FieldType.CHECKBOX:
      return Checkbox
    case FieldType.DATE:
      return DateField
    case FieldType.TIME:
      return TimeField
    case FieldType.ALPHA_PRINT_BUTTON:
      return AlphaPrintButton
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
      return AdministrativeArea
    case FieldType.LOCATION:
      return LocationSearch
    case FieldType.RADIO_GROUP:
      return RadioGroup
    case FieldType.SELECT:
      return Select
    case FieldType.COUNTRY:
      return SelectCountry
    case FieldType.TEXT:
      return Text
    case FieldType.NUMBER:
      return Number
    case FieldType.DIVIDER:
      return Divider
    case FieldType.PAGE_HEADER:
      return PageHeader
    case FieldType.PARAGRAPH:
      return Paragraph
    case FieldType.NAME:
      return Name
    case FieldType.SELECT_DATE_RANGE:
      return SelectDateRangeField
    case FieldType.HTTP:
      return Http
    case FieldType.LINK_BUTTON:
      return LinkButton
    case FieldType.VERIFICATION_STATUS:
      return VerificationStatus
    case FieldType.QUERY_PARAM_READER:
      return QueryParamReader
    case FieldType.AGE:
      return AgeField
    default:
      return undefined
  }
}

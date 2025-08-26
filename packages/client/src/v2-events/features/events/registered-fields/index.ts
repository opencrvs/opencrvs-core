import {
  Country,
  DateField as DateFieldType,
  FieldType,
  FieldTypeToFieldConfig,
  RadioField,
  SelectField
} from '@opencrvs/commons/client'

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
import { Address } from './Address'
import { BulletList } from './BulletList'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { DateField } from './DateField'
import { TimeField } from './TimeField'
import { AdministrativeArea } from './AdministrativeArea'
import { LocationSearch } from './LocationSearch'
import { RadioGroup } from './RadioGroup'
import { Select } from './Select'
import { SelectCountry } from './SelectCountry'
import { Text } from './Text'
import { Number } from './Number'
import { Divider } from './Divider'
import { PageHeader } from './PageHeader'
import { Paragraph } from './Paragraph'
import { Name } from './Name'
import { SelectDateRangeField } from './SelectDateRangeField'
import { Http } from './Http'
import { RegisteredFieldModule } from './RegisteredField'

export * from './Address'
export * from './BulletList'
export * from './Button'
export * from './Checkbox'
export * from './DateField'
export * from './TimeField'
export * from './AdministrativeArea'
export * from './LocationSearch'
export * from './RadioGroup'
export * from './Select'
export * from './SelectCountry'
export * from './Text'
export * from './Number'
export * from './Divider'
export * from './PageHeader'
export * from './Paragraph'
export * from './Name'
export * from './SelectDateRangeField'
export * from './Http'

export function getFieldByType<T extends FieldType>(
  type: T
): RegisteredFieldModule<FieldTypeToFieldConfig<T>> | undefined {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (type) {
    case FieldType.ADDRESS:
      return Address
    case FieldType.BULLET_LIST:
      return BulletList
    case FieldType.BUTTON:
      return Button
    case FieldType.CHECKBOX:
      return Checkbox
    case FieldType.DATE:
      return DateField as any
    case FieldType.TIME:
      return TimeField
    case FieldType.ADMINISTRATIVE_AREA:
      return AdministrativeArea
    case FieldType.LOCATION:
      return LocationSearch
    case FieldType.RADIO_GROUP:
      return RadioGroup as any
    case FieldType.SELECT:
      return Select as any
    case FieldType.COUNTRY:
      return SelectCountry as any
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
    default:
      return undefined
  }
}

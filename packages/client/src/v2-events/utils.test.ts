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
import { FieldType } from '@opencrvs/commons/client'
import { replacePlaceholders } from './utils'

const testCases = [
  {
    currentValue: undefined,
    defaultValue: undefined,
    meta: {
      $user: {
        district: '',
        province: ''
      }
    },
    expected: undefined,
    fieldType: FieldType.ADDRESS
  },
  {
    currentValue: undefined,
    defaultValue: 'Hello',
    meta: {
      $user: {
        district: '',
        province: ''
      }
    },
    expected: 'Hello',
    fieldType: FieldType.TEXT
  },
  {
    currentValue: undefined,
    defaultValue: '$user.district',
    meta: {
      $user: {
        district: 'Ibombo',
        province: ''
      }
    },
    expected: 'Ibombo',
    fieldType: FieldType.TEXT
  },
  {
    currentValue: 'Hello world',
    defaultValue: '$user.district',
    meta: {
      $user: {
        district: 'Ibombo',
        province: ''
      }
    },
    expected: 'Hello world',
    fieldType: FieldType.TEXT
  },
  {
    currentValue: undefined,
    defaultValue: {
      country: window.config.COUNTRY || ('FAR' as const),
      district: '$user.district',
      province: '$user.province',
      urbanOrRural: 'URBAN'
    },
    meta: {
      $user: {
        district: 'Ibombo',
        province: 'Central'
      }
    },
    expected: {
      country: window.config.COUNTRY || ('FAR' as const),
      district: 'Ibombo',
      province: 'Central',
      urbanOrRural: 'URBAN'
    },
    fieldType: FieldType.ADDRESS
  }
] as const

describe('replacePlaceholders', () => {
  testCases.forEach(({ expected, ...props }) => {
    it(`When currentValue is ${JSON.stringify(
      props.currentValue
    )} and defaultValue is ${JSON.stringify(
      props.defaultValue
    )} returns ${JSON.stringify(expected)}`, () => {
      const result = replacePlaceholders(props)
      expect(result).toEqual(expected)
    })
  })
})

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
  printMoneyReceipt,
  previewCertificate,
  printCertificate
} from '@client/views/PrintCertificate/PDFUtils'
import {
  mockApplicationData,
  userDetails,
  mockDeathApplicationData,
  mockOfflineData
} from '@client/tests/util'
import { createIntl } from 'react-intl'
import { Event } from '@client/forms'
import { omit, cloneDeep } from 'lodash'

const intl = createIntl({
  locale: 'en'
})

describe('PDFUtils related tests', () => {
  it('Print from money receipt template for birth event', () => {
    expect(() =>
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: mockApplicationData,
          event: Event.BIRTH
        },
        userDetails,
        mockOfflineData
      )
    ).not.toThrowError()
  })
  it('Print from money receipt template for death event', () => {
    expect(() =>
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: mockDeathApplicationData,
          event: Event.DEATH
        },
        userDetails,
        mockOfflineData
      )
    ).not.toThrowError()
  })
  it('Print money reciept function will throws exception if invalid userDetails found', () => {
    const deathApplication = omit(mockDeathApplicationData, 'deathEvent')
    expect(() =>
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: deathApplication,
          event: Event.DEATH
        },
        null,
        mockOfflineData
      )
    ).toThrowError('No user details found')
  })
  it('Print money reciept function will throws exception if receipt template is not present', () => {
    const faultyOfflineData = cloneDeep(mockOfflineData)
    faultyOfflineData.templates.receipt = null
    expect(() =>
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: mockDeathApplicationData,
          event: Event.DEATH
        },
        userDetails,
        faultyOfflineData
      )
    ).toThrowError('Money reciept template is misssing in offline data')
  })
  it('Throws exception if invalid key is provided', () => {
    const deathApplication = omit(mockDeathApplicationData, 'deathEvent')
    expect(() =>
      printCertificate(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: deathApplication,
          event: Event.DEATH
        },
        userDetails,
        mockOfflineData
      )
    ).toThrowError('No countries found for this transformer')
  })
  it('Throws exception if invalid userDetails found for printCertificate', () => {
    const deathApplication = omit(mockDeathApplicationData, 'deathEvent')
    expect(() =>
      printCertificate(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: deathApplication,
          event: Event.DEATH
        },
        null,
        mockOfflineData
      )
    ).toThrowError('No user details found')
  })
  it('Throws exception if invalid userDetails found for previewCertificate', () => {
    const deathApplication = omit(mockDeathApplicationData, 'deathEvent')
    expect(
      previewCertificate(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: deathApplication,
          event: Event.DEATH
        },
        null,
        mockOfflineData,
        (pdf: string) => {}
      )
    ).rejects.toThrowError('No user details found')
  })
})

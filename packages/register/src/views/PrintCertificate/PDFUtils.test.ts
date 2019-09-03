import {
  printMoneyReceipt,
  previewCertificate,
  printCertificate
} from '@register/views/PrintCertificate/PDFUtils'
import {
  mockApplicationData,
  userDetails,
  mockDeathApplicationData
} from '@register/tests/util'
import { createIntl } from 'react-intl'
import { Event } from '@register/forms'
import { omit } from 'lodash'

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
        userDetails
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
        userDetails
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
        null
      )
    ).toThrowError('No user details found')
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
        userDetails
      )
    ).toThrowError(
      'Given value key structure is not valid: deathEvent.deathDate'
    )
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
        null
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
        (pdf: string) => {}
      )
    ).rejects.toThrowError('No user details found')
  })
})

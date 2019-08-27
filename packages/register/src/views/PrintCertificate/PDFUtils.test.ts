import { printMoneyReceipt } from '@register/views/PrintCertificate/PDFUtils'
import {
  mockApplicationData,
  userDetails,
  mockDeathApplicationData
} from '@register/tests/util'
import { IntlProvider } from 'react-intl'
import { Event } from '@register/forms'

const intlProvider = new IntlProvider(
  {
    locale: 'en',
    messages: {
      message1: 'Hello world'
    }
  },
  {}
)
const { intl } = intlProvider.getChildContext()

describe('PDFUtils related tests', () => {
  it('Print from money receipt template for birth event', () => {
    expect(
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: mockApplicationData,
          event: Event.BIRTH
        },
        userDetails
      )
    ).toBeUndefined()
  })
  it('Print from money receipt template for death event', () => {
    expect(
      printMoneyReceipt(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: mockDeathApplicationData,
          event: Event.DEATH
        },
        userDetails
      )
    ).toBeUndefined()
  })
})

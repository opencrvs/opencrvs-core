import { generateAndPrintCertificate } from '@register/views/PrintCertificate/generatePDF'

describe('When invokeing PDF generate Library', () => {
  it.only('Should Show print prompt', () => {
    window.open = jest.fn()
    const CertificateDetails = {
      registrationNo: 'string',
      name: {
        bn: '',
        en: ''
      },
      doe: {
        bn: '',
        en: ''
      },
      registrationLocation: {
        bn: '',
        en: ''
      },
      eventLocation: {
        bn: '',
        en: ''
      },
      printDate: {
        bn: '',
        en: ''
      },
      event: 'death'
    }
    generateAndPrintCertificate(CertificateDetails)
    expect(window.open).toBeCalled()
  })
})

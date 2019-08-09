import { IPDFTemplate } from '@register/pdfRenderer'
import { localFonts } from '@register/pdfRenderer/templates/localFonts'

export const template: IPDFTemplate = {
  definition: {
    info: {
      title: 'Payment receipt'
    },
    defaultStyle: {
      font: 'notosans'
    },
    content: [
      {
        text: '{header}',
        style: 'header'
      },
      {
        text: '{registrantName}',
        style: 'header'
      },
      '\n\n',
      {
        text: [
          {
            text: '{serviceTitle}',
            style: 'subheader'
          },
          {
            text: '{serviceDescription}'
          }
        ]
      },
      {
        text: [
          {
            text: '{amountLabel}',
            style: 'subheader'
          },
          {
            text: '{amount}',
            style: 'amount'
          }
        ]
      },
      '\n\n\n\n',
      {
        columns: [
          {
            text: '{issuedAtLabel}',
            font: 'notosans',
            width: 58,
            style: 'subheader'
          },
          {
            text: '{issuedLocation}',
            font: 'notosanslocation'
          }
        ]
      },
      {
        columns: [
          {
            text: '{issuedByLabel}',
            font: 'notosans',
            width: 20,
            style: 'subheader'
          },
          {
            text: '{issuedBy}',
            font: 'notosanslocation'
          }
        ]
      },
      {
        columns: [
          {
            text: '{issuedDateLabel}',
            font: 'notosans',
            width: 100,
            style: 'subheader'
          },
          {
            text: '{issuedDate}',
            font: 'notosanslocation'
          }
        ]
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      amount: {
        font: 'notosanscurrency'
      },
      subheader: {
        bold: true
      }
    }
  },
  fonts: localFonts.fonts,
  vfs: localFonts.vfs,
  transformers: {
    header: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Receipt for {event} certificate of',
          description: 'Receipt header for payment on certificate',
          id: 'certificate.receipt.header'
        },
        messageValues: {
          event: 'event'
        }
      }
    },
    registrantName: {
      transformer: 'getApplicantName',
      payload: {
        bn: ['firstNames', 'familyName'],
        en: ['firstNamesEng', 'familyNameEng']
      }
    },
    serviceTitle: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Service:',
          description: 'Service received for receipt label',
          id: 'certificate.receipt.service'
        }
      }
    },
    //    serviceDescription: {},
    amountLabel: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Amount paid: ',
          description: 'Amount paid for certificate label',
          id: 'certificate.receipt.amount'
        }
      }
    },
    //  amount: {},
    issuedAtLabel: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Issued at:',
          description: 'Receipt on payment on certificate issued at label',
          id: 'certificate.receipt.issuedAt'
        }
      }
    },
    //issuedLocation: {},
    issuedByLabel: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'By:',
          description: 'Receipt on payment on certificate issued by label',
          id: 'certificate.receipt.issuedBy'
        }
      }
    },
    //issuedBy: {},
    issuedDateLabel: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Date of payment:',
          description: 'Receipt on payment on certificate issued date label',
          id: 'certificate.receipt.issuedDate'
        }
      }
    }
    //issuedDate: {}
  }
}

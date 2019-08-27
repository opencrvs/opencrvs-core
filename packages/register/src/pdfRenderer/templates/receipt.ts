import { IPDFTemplate } from '@register/pdfRenderer/transformer/types'
import { localFonts } from '@register/pdfRenderer/templates/localFonts'

export const template: IPDFTemplate = {
  definition: {
    pageSize: {
      // A5 document size
      width: 419.528,
      height: 595.276
    },
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
        table: {
          widths: ['100%'],
          body: [
            [
              {
                margin: [14, 15, 14, 0],
                border: [false, false, false, false],
                fillColor: '#F2F3F4',
                text: [
                  {
                    text: '{serviceTitle} ',
                    style: 'subheader'
                  },
                  {
                    text: '{serviceDescription}'
                  }
                ]
              }
            ],
            [
              {
                margin: [15, 0, 15, 15],
                border: [false, false, false, false],
                fillColor: '#F2F3F4',
                text: [
                  {
                    text: '{amountLabel} ',
                    style: 'subheader'
                  },
                  {
                    text: '{amount}',
                    style: 'amount'
                  }
                ]
              }
            ]
          ]
        }
      },
      '\n\n\n\n',
      {
        text: [
          {
            text: '{issuedAtLabel} ',
            font: 'notosans',
            style: 'subheader'
          },
          {
            text: '{issuedLocation}',
            font: 'notosanslocation'
          }
        ]
      },
      {
        text: [
          {
            text: '{issuedByLabel} ',
            font: 'notosans',
            style: 'subheader'
          },
          {
            text: '{issuedByRole}'
          },
          ', ',
          {
            text: '{issuedBy}',
            font: 'notosanslocation'
          }
        ]
      },
      {
        text: [
          {
            text: '{issuedDateLabel} ',
            font: 'notosans',
            style: 'subheader'
          },
          {
            text: '{issuedDate}'
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
  transformers: [
    {
      field: 'header',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'Receipt for {event} Certificate of',
          description: 'Receipt header for payment on certificate',
          id: 'certificate.receipt.header'
        },
        messageValues: {
          event: 'event'
        }
      }
    },
    {
      field: 'registrantName',
      operation: 'ApplicantName',
      parameters: {
        key: {
          birth: 'child',
          death: 'deceased'
        },
        format: {
          bn: ['firstNames', 'familyName'],
          en: ['firstNamesEng', 'familyNameEng']
        }
      }
    },
    {
      field: 'serviceTitle',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'Service:',
          description: 'Service received for receipt label',
          id: 'certificate.receipt.service'
        }
      }
    },
    {
      field: 'serviceDescription',
      operation: 'ServiceLabel',
      parameters: {
        '45d+birth': {
          defaultMessage: 'Birth registratin after 45 days of date of birth',
          description: 'Label for service 1 for birth',
          id: 'certificate.receipt.service1.birth'
        },
        '45d+death': {
          defaultMessage: 'Death registratin after 45 days of date of death',
          description: 'Label for service 1 for death',
          id: 'certificate.receipt.service1.death'
        },
        '5y+birth': {
          defaultMessage: 'Birth registratin after 5 years of date of birth',
          description: 'Label for service 2 for birth',
          id: 'certificate.receipt.service2.birth'
        },
        '5y+death': {
          defaultMessage: 'Death registratin after 5 years of date of death',
          description: 'Label for service 2 for death',
          id: 'certificate.receipt.service2.death'
        }
      }
    },
    {
      field: 'amountLabel',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'Amount paid: ',
          description: 'Amount paid for certificate label',
          id: 'certificate.receipt.amount'
        }
      }
    },
    {
      field: 'amount',
      operation: 'ServiceAmount',
      parameters: {
        '45d+': {
          defaultMessage: '\u09F3 25',
          description: 'Amount for service 1',
          id: 'certificate.receipt.service1.amount'
        },
        '5y+': {
          defaultMessage: '\u09F3 50',
          description: 'Amount for service 2',
          id: 'certificate.receipt.service2.amount'
        }
      }
    },
    {
      field: 'issuedAtLabel',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'Issued at:',
          description: 'Receipt on payment on certificate issued at label',
          id: 'certificate.receipt.issuedAt'
        }
      }
    },
    {
      field: 'issuedLocation',
      operation: 'LoggedInUserOfficeName',
      baseData: 'userdetails'
    },
    {
      field: 'issuedByLabel',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'By:',
          description: 'Receipt on payment on certificate issued by label',
          id: 'certificate.receipt.issuedBy'
        }
      }
    },
    {
      field: 'issuedByRole',
      operation: 'LoggedInUserRole',
      baseData: 'userdetails'
    },
    {
      field: 'issuedBy',
      operation: 'LoggedInUserName',
      baseData: 'userdetails'
    },
    {
      field: 'issuedDateLabel',
      operation: 'IntlLabel',
      parameters: {
        messageDescriptor: {
          defaultMessage: 'Date of payment:',
          description: 'Receipt on payment on certificate issued date label',
          id: 'certificate.receipt.issuedDate'
        }
      }
    },
    {
      field: 'issuedDate',
      operation: 'DateFieldValue',
      parameters: {
        format: 'DD.MM.YYYY',
        momentLocale: {
          en: 'locale/en-ie',
          bn: 'locale/bn'
        }
      }
    }
  ]
}

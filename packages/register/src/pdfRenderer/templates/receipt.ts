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
      operation: 'ConditionExecutor',
      parameters: {
        fromKey: {
          birth: 'child.childBirthDate',
          death: 'deathEvent.deathDate'
        },
        toKey: 'CURRENT_DATE',
        conditions: [
          {
            type: 'COMPARE_DATE_IN_DAYS',
            minDiff: 46,
            maxDiff: 1825,
            output: {
              messageDescriptor: {
                defaultMessage:
                  '{event} registratin after 45 days of date of event',
                description: 'Label for 45 day+ service of event',
                id: 'certificate.receipt.service.45day'
              },
              messageValues: {
                event: 'event'
              }
            }
          },
          {
            type: 'COMPARE_DATE_IN_DAYS',
            minDiff: 1826,
            maxDiff: 2147483647,
            output: {
              messageDescriptor: {
                defaultMessage:
                  '{event} registratin after 5 years of date of event',
                description: 'Label for 5 year+ service of event',
                id: 'certificate.receipt.service.5year'
              },
              messageValues: {
                event: 'event'
              }
            }
          }
        ]
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
      operation: 'ConditionExecutor',
      parameters: {
        fromKey: {
          birth: 'child.childBirthDate',
          death: 'deathEvent.deathDate'
        },
        toKey: 'CURRENT_DATE',
        conditions: [
          {
            type: 'COMPARE_DATE_IN_DAYS',
            minDiff: 46,
            maxDiff: 1825,
            output: {
              messageDescriptor: {
                defaultMessage: '\u09F3 25',
                description: 'Amount for 45 day+ service of event',
                id: 'certificate.receipt.service.45day.amount'
              }
            }
          },
          {
            type: 'COMPARE_DATE_IN_DAYS',
            minDiff: 1826,
            maxDiff: 2147483647,
            output: {
              messageDescriptor: {
                defaultMessage: '\u09F3 50',
                description: 'Amount for 5 year+ service of event',
                id: 'certificate.receipt.service.5year.amount'
              }
            }
          }
        ]
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

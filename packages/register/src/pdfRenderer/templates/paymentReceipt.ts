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
        text: [
          {
            text: '{issuedAtLabel}',
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
            text: '{issuedByLabel}',
            font: 'notosans',
            style: 'subheader'
          },
          {
            text: '{issuedBy}',
            font: 'notosanslocation'
          }
        ]
      },
      {
        text: [
          {
            text: '{issuedDateLabel}',
            font: 'notosans',
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
    serviceDescription: {
      transformer: 'getServiceLabel',
      payload: {
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
    amount: {
      transformer: 'getServiceAmount',
      payload: {
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
    issuedLocation: {
      transformer: 'getLoggedInUserFieldValue',
      baseData: 'userdetails',
      payload: {
        valueKey: 'primaryOffice.name'
      }
    },
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
    issuedBy: {
      transformer: 'getLoggedInUserRoleAndName',
      baseData: 'userdetails'
    },
    issuedDateLabel: {
      transformer: 'getIntlLabel',
      payload: {
        messageDescriptor: {
          defaultMessage: 'Date of payment:',
          description: 'Receipt on payment on certificate issued date label',
          id: 'certificate.receipt.issuedDate'
        }
      }
    },
    issuedDate: {
      transformer: 'getDateFieldValue',
      payload: {
        format: 'DD.MM.YYYY'
      }
    }
  }
}

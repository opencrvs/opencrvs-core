import { IPDFTemplate } from '@register/pdfRenderer'
import { localFonts } from '@register/pdfRenderer/templates/localFonts'

export const template: IPDFTemplate = {
  definition: {
    info: {
      title: '{title}'
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
            text: '{serviceTitle}'
          },
          {
            text: '{serviceDescription}',
            style: 'subheader'
          }
        ]
      },
      {
        text: '{amountLabel}'
      },
      {
        text: '{amount}\n\n',
        style: 'amount'
      },
      {
        columns: [
          {
            text: '{issuedAtLabel}',
            font: 'notosans',
            width: 65
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
            width: 20
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
            width: 90
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
        fontSize: 18
      },
      amount: {
        font: 'notosanscurrency',
        fontSize: 30,
        bold: true
      },
      subheader: {
        bold: true
      }
    }
  },
  fonts: localFonts.fonts,
  vfs: localFonts.vfs,
  transformers: {
    title: {
      transformer: 'getIntlLabel',
      payload: {
        defaultMessage: 'Certificate Collection',
        description: 'The title of print certificate action',
        id: 'print.certificate.section.title'
      }
    },
    header: {
      transformer: 'getIntlLabel',
      payload: {
        defaultMessage: 'Certificate Collection',
        description: 'The title of print certificate action',
        id: 'print.certificate.section.title'
      }
    }
  }
}

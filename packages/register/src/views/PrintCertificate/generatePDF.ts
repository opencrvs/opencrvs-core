import { defineMessages, InjectedIntl } from 'react-intl'
import * as pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'src/vfs_fonts'
import { CERTIFICATE_DATE_FORMAT } from 'src/utils/constants'
import * as moment from 'moment'
import 'moment/locale/bn'
import 'moment/locale/en-ie'

const messages = defineMessages({
  certificateHeader: {
    id: 'register.work-queue.certificate.header'
  },
  certificateSubHeader: {
    id: 'register.work-queue.certificate.subheader'
  },
  certificateIssuer: {
    id: 'register.work-queue.certificate.issuer'
  },
  certificatePaidAmount: {
    id: 'register.work-queue.certificate.amount'
  },
  certificateService: {
    id: 'register.work-queue.certificate.service'
  }
})

export type Registrant = {
  name: string
  DOBDiff: string
}

export type Issuer = {
  name: string
  role: string
  issuedAt: string
}

export function generateMoneyReceipt(
  intl: InjectedIntl,
  registrant: Registrant,
  IssuerDetails: Issuer,
  amount: string,
  language: string
) {
  const dateOfPayment = moment().format(CERTIFICATE_DATE_FORMAT)
  const docDefinition = {
    info: {
      title: 'Receipt-for-Birth-Certificate'
    },
    defaultStyle: {
      font: 'notosans'
    },
    content: [
      {
        text: intl.formatMessage(messages.certificateHeader),
        style: 'header'
      },
      {
        text: registrant.name,
        style: 'header'
      },
      '\n\n',
      {
        text: [
          {
            text: intl.formatMessage(messages.certificateService)
          },
          {
            text: intl.formatMessage(messages.certificateSubHeader, {
              DOBDiff: registrant.DOBDiff
            }),
            style: 'subheader'
          }
        ]
      },
      intl.formatMessage(messages.certificatePaidAmount),
      {
        text: `${amount}\n\n`,
        style: 'amount'
      },
      intl.formatMessage(messages.certificateIssuer, {
        issuedAt: IssuerDetails.issuedAt,
        role: IssuerDetails.role,
        name: IssuerDetails.name,
        dateOfPayment
      })
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
  }
  const fonts = {
    bn: {
      notosans: {
        normal: 'NotoSansBengali-Light.ttf',
        regular: 'NotoSansBengali-Light.ttf',
        bold: 'NotoSansBengali-Regular.ttf'
      },
      notosanscurrency: {
        normal: 'NotoSansBengali-Light.ttf',
        regular: 'NotoSansBengali-Light.ttf',
        bold: 'NotoSansBengali-Light.ttf'
      }
    },
    en: {
      notosanscurrency: {
        normal: 'NotoSansBengali-Light.ttf',
        regular: 'NotoSansBengali-Light.ttf',
        bold: 'NotoSansBengali-Light.ttf'
      },
      notosans: {
        normal: 'NotoSans-Light.ttf',
        regular: 'NotoSans-Light.ttf',
        bold: 'NotoSans-Regular.ttf'
      }
    }
  }
  const font = fonts[language]

  pdfMake.vfs = pdfFonts.pdfMake.vfs
  const generatedPDF = pdfMake.createPdf(docDefinition, null, font)

  generatedPDF.open()
}

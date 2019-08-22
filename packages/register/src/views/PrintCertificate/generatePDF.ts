import { InjectedIntl } from 'react-intl'
import { createPDF, printPDF } from '@register/pdfRenderer'
import { template as receiptTemplate } from '@register/pdfRenderer/templates/receipt'
import { template as birthCertificateTemplate } from '@register/pdfRenderer/templates/birthCertificate'
import { template as deathCertificateTemplate } from '@register/pdfRenderer/templates/deathCertificate'
import { IApplication } from '@register/applications'
import { IUserDetails } from '@opencrvs/register/src/utils/userUtils'
import { Event } from '@register/forms'

export type MultiLingualDetails = {
  bn: string
  en: string
}

export type CertificateDetails = {
  registrationNo: string
  name: MultiLingualDetails
  doe: MultiLingualDetails
  registrationLocation: MultiLingualDetails
  eventLocation: MultiLingualDetails
  printDate?: MultiLingualDetails
  event: string
} | null

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
  application: IApplication,
  userDetails: IUserDetails | null
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(receiptTemplate, application, userDetails, intl)
}

export async function generateCertificateDataURL(
  intl: InjectedIntl,
  application: IApplication,
  userDetails: IUserDetails | null,
  callBack: (pdf: string) => void
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  await createPDF(
    application.event === Event.BIRTH
      ? birthCertificateTemplate
      : deathCertificateTemplate,
    application,
    userDetails,
    intl
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export function generateAndPrintCertificate(
  intl: InjectedIntl,
  application: IApplication,
  userDetails: IUserDetails | null
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    application.event === Event.BIRTH
      ? birthCertificateTemplate
      : deathCertificateTemplate,
    application,
    userDetails,
    intl
  )
}

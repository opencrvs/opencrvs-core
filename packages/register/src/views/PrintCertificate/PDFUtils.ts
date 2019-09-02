import { IntlShape } from 'react-intl'
import { createPDF, printPDF } from '@register/pdfRenderer'
import { template as receiptTemplate } from '@register/pdfRenderer/templates/receipt'
import { template as birthCertificateTemplate } from '@register/pdfRenderer/templates/birthCertificate'
import { template as deathCertificateTemplate } from '@register/pdfRenderer/templates/deathCertificate'
import { IApplication } from '@register/applications'
import { IUserDetails } from '@opencrvs/register/src/utils/userUtils'
import { Event } from '@register/forms'
import { IOfflineData } from '@register/offline/reducer'

export function printMoneyReceipt(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(receiptTemplate, application, userDetails, offlineResource, intl)
}

export async function previewCertificate(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
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
    offlineResource,
    intl
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export function printCertificate(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData
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
    offlineResource,
    intl
  )
}

import { IntlShape } from 'react-intl'
import { createPDF, printPDF } from '@register/pdfRenderer'
import { IApplication } from '@register/applications'
import { IUserDetails } from '@opencrvs/register/src/utils/userUtils'
import { Event } from '@register/forms'
import { IOfflineData } from '@register/offline/reducer'
import { OptionalData } from '@register/pdfRenderer/transformer/types'

export function printMoneyReceipt(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  if (!offlineResource.templates || !offlineResource.templates.receipt) {
    throw new Error('Money reciept template is misssing in offline data')
  }
  printPDF(
    offlineResource.templates.receipt,
    application,
    userDetails,
    offlineResource,
    intl
  )
}

export async function previewCertificate(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  callBack: (pdf: string) => void,
  optionalData?: OptionalData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  await createPDF(
    application.event === Event.BIRTH
      ? offlineResource.templates.certificates.birth
      : offlineResource.templates.certificates.death,
    application,
    userDetails,
    offlineResource,
    intl,
    optionalData
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export function printCertificate(
  intl: IntlShape,
  application: IApplication,
  userDetails: IUserDetails | null,
  offlineResource: IOfflineData,
  optionalData?: OptionalData
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    application.event === Event.BIRTH
      ? offlineResource.templates.certificates.birth
      : offlineResource.templates.certificates.death,
    application,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
}

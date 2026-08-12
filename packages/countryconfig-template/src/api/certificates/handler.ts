/* eslint-disable no-unused-vars */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { Event } from '@countryconfig/events/utils'
import { ActionType, event, never, not } from '@opencrvs/toolkit/events'

type FontFamilyTypes = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type JSONSchema = Record<string, any>

export interface ICertificateConfigData {
  id: string
  event: Event
  // This is a temporary field to indicate that the certificate is a v2 template.
  // As the templates are assigned to event types per id, we would not be able to define separate templates for v1 and v2 'birth' or 'death' events without this.
  // After v1 is phased out, this field can be removed.
  isV2Template?: boolean
  label: {
    id: string
    defaultMessage: string
    description: string
  }
  isDefault: boolean
  fee: {
    onTime: number
    late: number
    delayed: number
  }
  svgUrl: string
  fonts?: Record<string, FontFamilyTypes>
  conditionals?:
    | {
        type: 'SHOW'
        conditional: JSONSchema
      }[]
    | undefined
}

const notoSansFont: Record<string, FontFamilyTypes> = {
  'Noto Sans': {
    normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
    bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
    italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
    bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
  }
}

const libreBaskervilleFont: Record<string, FontFamilyTypes> = {
  'Libre Baskerville': {
    normal: '/api/countryconfig/fonts/LibreBaskerville-Regular.ttf',
    bold: '/api/countryconfig/fonts/LibreBaskerville-Bold.ttf',
    italics: '/api/countryconfig/fonts/LibreBaskerville-Italic.ttf',
    bolditalics: '/api/countryconfig/fonts/LibreBaskerville-Regular.ttf'
  }
}

export async function certificateHandler(
  request: Request,
  h: ResponseToolkit
): Promise<ICertificateConfigData[] | ResponseObject> {
  if (request.params.id) {
    const filePath = `${__dirname}/source/${request.params.id}`
    return h.file(filePath)
  }
  const certificateConfigs: ICertificateConfigData[] = [
    {
      id: 'birth-certificate',
      event: Event.Birth,
      label: {
        id: 'certificates.birth.certificate',
        defaultMessage: 'Birth Certificate',
        description: 'The label for a birth certificate'
      },
      isDefault: true,
      fee: {
        onTime: 5,
        late: 7,
        delayed: 15
      },
      svgUrl: '/api/countryconfig/certificates/birth-certificate.svg',
      fonts: libreBaskervilleFont
    },
    {
      id: 'birth-certificate-certified-copy',
      event: Event.Birth,
      label: {
        id: 'certificates.birth.certificate.copy',
        defaultMessage: 'Birth Certificate certified copy',
        description: 'The label for a birth certificate'
      },
      isDefault: false,
      fee: {
        onTime: 8,
        late: 11.5,
        delayed: 17
      },
      svgUrl:
        '/api/countryconfig/certificates/birth-certificate-certified-copy.svg',
      fonts: notoSansFont,
      conditionals: [
        {
          type: 'SHOW',
          // Show only if original certificate was printed
          conditional: event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1)
        }
      ]
    },
    {
      id: 'birth-registration-receipt',
      event: Event.Birth,
      label: {
        id: 'certificates.birth.registration.receipt',
        defaultMessage: 'Birth Registration Receipt',
        description: 'The label for a birth registration receipt'
      },
      isDefault: false,
      fee: {
        onTime: 0,
        late: 12,
        delayed: 18
      },
      svgUrl: '/api/countryconfig/certificates/birth-registration-receipt.svg',
      fonts: notoSansFont
    },
    {
      id: 'death-certificate',
      event: Event.Death,
      label: {
        id: 'certificates.death.certificate',
        defaultMessage: 'Death Certificate',
        description: 'The label for a death certificate'
      },
      isDefault: true,
      fee: {
        onTime: 3,
        late: 5.7,
        delayed: 12
      },
      svgUrl: '/api/countryconfig/certificates/death-certificate.svg',
      fonts: notoSansFont
    },
    {
      id: 'death-certificate-certified-copy',
      event: Event.Death,
      label: {
        id: 'certificates.death.certificate.copy',
        defaultMessage: 'Death Certificate certified copy',
        description: 'The label for a death certificate'
      },
      isDefault: false,
      fee: {
        onTime: 6,
        late: 9,
        delayed: 14.5
      },
      svgUrl:
        '/api/countryconfig/certificates/death-certificate-certified-copy.svg',
      fonts: notoSansFont,
      conditionals: [
        {
          type: 'SHOW',
          // Show only if original certificate was printed
          conditional: event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1)
        }
      ]
    },
    {
      id: 'marriage-certificate',
      event: Event.Marriage,
      label: {
        id: 'certificates.marriage.certificate',
        defaultMessage: 'Marriage Certificate',
        description: 'The label for a marriage certificate'
      },
      isDefault: true,
      fee: {
        onTime: 4.4,
        late: 6,
        delayed: 13.5
      },
      svgUrl: '/api/countryconfig/certificates/marriage-certificate.svg',
      fonts: notoSansFont
    },
    {
      id: 'marriage-certificate-certified-copy',
      event: Event.Marriage,
      label: {
        id: 'certificates.marriage.certificate.copy',
        defaultMessage: 'Marriage Certificate certified copy',
        description: 'The label for a marriage certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/marriage-certificate-certified-copy.svg',
      fonts: notoSansFont
    },
    {
      id: 'v2.birth-certificate',
      event: Event.Birth,
      isV2Template: true,
      label: {
        id: 'certificates.birth.certificate',
        defaultMessage: 'Birth Certificate copy',
        description: 'The label for a birth certificate'
      },
      isDefault: true,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl: '/api/countryconfig/certificates/v2.birth-certificate.svg',
      fonts: notoSansFont,
      conditionals: [
        {
          type: 'SHOW',
          conditional: not(event.hasAction(ActionType.PRINT_CERTIFICATE))
        }
      ]
    },
    {
      id: 'v2.birth-certified-certificate',
      event: Event.Birth,
      isV2Template: true,
      label: {
        id: 'certificates.birth.certificate.copy',
        defaultMessage: 'Birth Certificate certified copy',
        description: 'The label for a birth certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.birth-certificate-certified-copy.svg',
      fonts: libreBaskervilleFont,
      conditionals: [
        {
          type: 'SHOW',
          // Show only after the standard birth certificate has been printed at least once
          conditional: event
            .hasAction(ActionType.PRINT_CERTIFICATE)
            .withTemplate('v2.birth-certificate')
            .minCount(1)
        }
      ]
    },
    {
      id: 'v2.tennis-club-membership-certificate',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      isV2Template: true,
      label: {
        id: 'certificates.tennis-club-membership.certificate.copy',
        defaultMessage: 'Tennis Club Membership Certificate copy',
        description: 'The label for a tennis-club-membership certificate'
      },
      isDefault: true,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-certificate.svg',
      fonts: notoSansFont,
      conditionals: [
        {
          type: 'SHOW',
          // Show only for registered events
          conditional: event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(0)
        }
      ]
    },
    {
      id: 'v2.tennis-club-membership-certified-certificate',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      isV2Template: true,
      label: {
        id: 'certificates.tennis-club-membership.certificate.certified-copy',
        defaultMessage: 'Tennis Club Membership Certificate certified copy',
        description: 'The label for a tennis-club-membership certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-certified-certificate.svg',
      fonts: notoSansFont
    },
    {
      id: 'v2.tennis-club-membership-certificate-multipage',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      isV2Template: true,
      label: {
        id: 'certificates.tennis-club-membership.certificate.multipage',
        defaultMessage: 'Tennis Club Membership Certificate Multipage',
        description: 'The label for a tennis club membership certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-certificate-multipage.svg',
      fonts: libreBaskervilleFont
    },
    {
      id: 'v2.tennis-club-membership-certificate-alpha',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      isV2Template: true,
      label: {
        id: 'certificates.tennis-club-membership.certificate.alpha',
        defaultMessage: 'Tennis Club Membership Certificate Alpha',
        description:
          'The label for a tennis club membership certificate for alpha print button testing'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-alpha.svg',
      fonts: libreBaskervilleFont,
      conditionals: [
        {
          type: 'SHOW',
          // Never show in print-cert flow
          conditional: never()
        }
      ]
    },
    {
      id: 'v2.death-certificate',
      event: Event.Death,
      isV2Template: true,
      label: {
        id: 'certificates.death.certificate',
        defaultMessage: 'Death Certificate copy',
        description: 'The label for a death certificate'
      },
      isDefault: true,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl: '/api/countryconfig/certificates/v2.death-certificate.svg',
      fonts: libreBaskervilleFont
    },
    {
      id: 'v2.death-certified-certificate',
      event: Event.Death,
      isV2Template: true,
      label: {
        id: 'certificates.death.certificate.copy',
        defaultMessage: 'Death Certificate certified copy',
        description: 'The label for a death certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.death-certificate-certified-copy.svg',
      fonts: libreBaskervilleFont
    }
  ]
  return certificateConfigs
}

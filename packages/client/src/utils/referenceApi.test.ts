/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { certificateQueries } from '@client/certificate/queries'
import { referenceApi } from '@client/utils/referenceApi'
import * as fetchMock from 'jest-fetch-mock'

jest.unmock('@client/utils/referenceApi')

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

export const mockFetchLocations = {
  data: {
    'ba819b89-57ec-4d8b-8b91-e8865579a40f': {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  }
}

export const mockFetchFacilities = {
  data: [
    {
      id: '3fadd4e1-bcfd-470b-a997-07bc09631e2c',
      name: 'Moktarpur Union Parishad',
      alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      type: 'CRVS_OFFICE',
      partOf: 'Location/9ce9fdba-ae24-467f-87ab-5b5498a0217f'
    }
  ]
}

export const mockFetchPilotLocations = {
  data: {
    'bfe8306c-0910-48fe-8bf5-0db906cf3155': {
      alias: 'বানিয়াজান',
      id: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
      jurisdictionType: 'UNION',
      name: 'Baniajan',
      partOf: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      physicalType: 'Jurisdiction',
      type: 'ADMIN_STRUCTURE'
    }
  }
}

export const mockCertificatesTemplatesDefinitionData = {
  birth: {
    svgCode: '<svg><svg/>'
  },
  death: {
    svgCode: '<svg><svg/>'
  }
}

export const mockFetchCertificatesTemplatesDefinition = [
  {
    event: 'birth',
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: 1640696680593,
    svgDateUpdated: 1644326332088,
    svgFilename: 'oCRVS_DefaultZambia_Death_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  },
  {
    event: 'death',
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: 1640696804785,
    svgDateUpdated: 1643885502999,
    svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  }
]

export const mockCertificateTemplate = {
  data: {
    getActiveCertificatesSVG: [
      {
        event: 'birth',
        status: 'ACTIVE',
        svgCode: '<svg><svg/>',
        svgDateCreated: '1640696680593',
        svgDateUpdated: '1643292458812',
        svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
        user: 'jonathan.campbell',
        __typename: 'CertificateSVG',
        _id: '61cb0b68ab0cc2e187089786'
      },
      {
        event: 'death',
        status: 'ACTIVE',
        svgCode: '<svg><svg/>',
        svgDateCreated: '1640696804785',
        svgDateUpdated: '1643292520393',
        svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
        user: 'jonathan.campbell',
        __typename: 'CertificateSVG',
        _id: '61cb0be4ab0cc2e187089787'
      }
    ]
  }
}

export const mockFetchConfig = {
  config: {
    API_GATEWAY_URL: 'http://localhost:7070/',
    CONFIG_API_URL: 'http://localhost:2021',
    LOGIN_URL: 'http://localhost:3020',
    AUTH_URL: 'http://localhost:4040',
    RESOURCES_URL: 'http://localhost:3040',
    APPLICATION_NAME: 'Farajaland CRVS',
    CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
    CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
    UI_POLLING_INTERVAL: 5000,
    FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
    DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
    INFORMANT_MINIMUM_AGE: 16,
    HIDE_EVENT_REGISTER_INFORMATION: false,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    PHONE_NUMBER_PATTERN: {
      pattern: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
      example: '0970545855',
      start: '0[7|9]',
      num: '10',
      mask: {
        startForm: 4,
        endBefore: 2
      }
    },
    SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
    LOGROCKET: 'opencrvs-foundation/opencrvs-zambia',
    NID_NUMBER_PATTERN: {
      pattern: '/^[0-9]{9}$/',
      example: '4837281940',
      num: '9'
    },
    COUNTRY: 'zmb',
    CURRENCY: {
      isoCode: 'ZMW',
      languagesAndCountry: ['en-ZM']
    },
    LANGUAGES: 'en'
  },
  certificates: [
    {
      _id: '620bdfb896974e7de5a91624',
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <rect width='420' height='595' fill='white'/> <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='210' y='445.552'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='308.828' text-anchor='middle' >{eventDate}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='287.69' text-anchor='middle'>Was born on </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='345.69' text-anchor='middle'>Place of birth </tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'> <tspan x='211' y='384.004'></tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='367.828' text-anchor='middle'>{placeOfBirth}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='245.828' text-anchor='middle'>{informantName}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='224.69' text-anchor='middle'>This is to certify that </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'> <tspan x='50%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'> <tspan x='50%' y='127.828' text-anchor='middle'>Birth Registration No </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='170.104' text-anchor='middle'>Date of issuance of certificate:{certificateDate}</tspan> </text> <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5'/> <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5'/> <rect x='188' y='51' width='46.7463' height='54' fill='url(#pattern0)'/> <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='539.552' text-anchor='middle'>{registrarName}</tspan> <tspan x='50%' y='551.552' text-anchor='middle'>({role}) </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='209.587' y='562.336'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='429.552' text-anchor='middle'>This event was registered at{registrationLocation}</tspan> </text> <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)'/> <defs> <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)'/> </pattern> <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)'/> </pattern> <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}'/> <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}'/> </defs></svg>",
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
      user: 'jonathan.campbell',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1643292458812,
      svgDateCreated: 1640696680593
    },
    {
      _id: '620bdfb896974e7de5a91625',
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <rect width='420' height='595' fill='white'/> <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='210' y='445.552'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='308.828' text-anchor='middle' >{eventDate}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='287.69' text-anchor='middle'>Died on </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='345.69' text-anchor='middle'>Place of death </tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'> <tspan x='211' y='384.004'></tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='367.828' text-anchor='middle'>{placeOfDeath}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='245.828' text-anchor='middle'>{informantName}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='224.69' text-anchor='middle'>This is to certify that </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'> <tspan x='50%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'> <tspan x='50%' y='127.828' text-anchor='middle'>Death Registration No </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='170.104' text-anchor='middle'>Date of issuance of certificate:{certificateDate}</tspan> </text> <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5'/> <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5'/> <rect x='188' y='51' width='46.7463' height='54' fill='url(#pattern0)'/> <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='539.552' text-anchor='middle'>{registrarName}</tspan> <tspan x='50%' y='551.552' text-anchor='middle'>({role}) </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='209.587' y='562.336'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='429.552' text-anchor='middle'>This event was registered at{registrationLocation}</tspan> </text> <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)'/> <defs> <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)'/> </pattern> <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)'/> </pattern> <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}'/> <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}'/> </defs></svg>",
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
      user: 'jonathan.campbell',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1643292520393,
      svgDateCreated: 1640696804785
    }
  ]
}

describe('referenceApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('retrieves the locations from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchLocations))

    const data = await referenceApi.loadLocations()
    expect(data).toEqual(mockFetchLocations.data)
  })

  it('retrieves the facilities from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchFacilities))

    const data = await referenceApi.loadFacilities()
    expect(data).toEqual(mockFetchFacilities.data)
  })

  it('retrieves the pilot location list from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchPilotLocations))

    const data = await referenceApi.loadPilotLocations()
    expect(data).toEqual(mockFetchPilotLocations.data)
  })

  it('retrieves the config from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchConfig))

    const data = await referenceApi.loadConfig()
    expect(data).toEqual(mockFetchConfig)
  })
})

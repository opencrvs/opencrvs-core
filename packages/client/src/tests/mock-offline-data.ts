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
import { ILanguage } from '@client/i18n/reducer'
import type {
  AdminStructure,
  CRVSOffice,
  Facility,
  IForms
} from '@client/offline/reducer'
import { System, SystemStatus } from '@client/utils/gateway'
import {
  CertificateConfiguration,
  ICertificateData
} from '@client/utils/referenceApi'
import forms from './forms.json'
import languages from './languages.json'
import templates from './templates.json'
import { SystemType } from '@opencrvs/commons/client'

export const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='

const systems: System[] = [
  {
    name: 'WebHook 1',
    status: SystemStatus.Active,
    type: SystemType.Webhook,
    _id: '63998b6efbd0f8bad7708033',
    shaSecret: 'c37d4f5d-4c12-4016-9c7e-d810d2f871df',
    clientId: '4a7ba5bc-46c7-469e-8d61-20dd4d86e79a',
    settings: {
      webhook: [
        {
          event: 'birth',
          permissions: ['informant-details', 'supporting-documents']
        },
        {
          event: 'death',
          permissions: ['deceased-details', 'death-encounter']
        }
      ]
    }
  },
  {
    _id: '63a01ffe607915acacc2f553',
    clientId: '5923118f-c633-40c6-ba97-c3e3cbb412aa',
    name: 'Health Deactivation',
    shaSecret: '2569a6d4-1f38-4f53-8724-1bfcba8262f6',
    status: SystemStatus.Deactivated,
    type: SystemType.Health,
    settings: {},
    __typename: 'System'
  }
]

export const mockOfflineData = {
  forms: forms.forms as IForms,
  userForms: forms.userForm,
  facilities: {
    '627fc0cc-e0e2-4c09-804d-38a9fa1807ee': {
      id: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee',
      name: 'Shaheed Taj Uddin Ahmad Medical College',
      alias: 'শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/3a5358d0-1bcd-4ea9-b0b7-7cfb7cbcbf0f'
    },
    'ae5b4462-d1b2-4b22-b289-a66f912dce73': {
      id: 'ae5b4462-d1b2-4b22-b289-a66f912dce73',
      name: 'Kaliganj Union Sub Center',
      alias: 'কালীগঞ্জ ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    '6abbb7b8-d02e-41cf-8a3e-5039776c1eb0': {
      id: '6abbb7b8-d02e-41cf-8a3e-5039776c1eb0',
      name: 'Kaliganj Upazila Health Complex',
      alias: 'কালীগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    '0d8474da-0361-4d32-979e-af91f020309e': {
      id: '0d8474da-0361-4d32-979e-af91f020309e',
      name: 'Dholashadhukhan Cc',
      alias: 'ধলাশাধুখান সিসি - কালিগঞ্জ',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    }
  } satisfies Record<string, Facility>,
  offices: {
    '0d8474da-0361-4d32-979e-af91f012340a': {
      id: '0d8474da-0361-4d32-979e-af91f012340a',
      name: 'Moktarpur Union Parishad',
      alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'CRVS_OFFICE',
      partOf: 'Location/7a18cb4c-38f3-449f-b3dc-508473d485f3'
    },
    'da672661-eb0a-437b-aa7a-a6d9a1711dd1': {
      id: 'da672661-eb0a-437b-aa7a-a6d9a1711dd1',
      name: 'Comilla Union Parishad',
      alias: 'কুমিল্লা ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      statisticalId: '456',
      status: 'active',
      type: 'CRVS_OFFICE',
      partOf: 'Location/5926982b-845c-4463-80aa-cbfb86762e0a'
    },
    '213ec5f3-e306-4f95-8058-f37893dbfbb6': {
      id: '213ec5f3-e306-4f95-8058-f37893dbfbb6',
      name: 'Chittagong Union Parishad',
      alias: 'চট্টগ্রাম ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      statisticalId: '234',
      status: 'active',
      type: 'CRVS_OFFICE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '93259d69-71af-488f-8ada-32d06678df17': {
      id: '93259d69-71af-488f-8ada-32d06678df17',
      name: 'Dhaka Union Parishad',
      alias: 'ঢাকা ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      statisticalId: '345',
      status: 'active',
      type: 'CRVS_OFFICE',
      partOf: 'Location/6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b'
    }
  } satisfies Record<string, CRVSOffice>,
  locations: {
    '65cf62cb-864c-45e3-9c0d-5c70f0074cb4': {
      id: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
      name: 'Barisal',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '8cbc862a-b817-4c29-a490-4a8767ff023c': {
      id: '8cbc862a-b817-4c29-a490-4a8767ff023c',
      name: 'Chittagong',
      alias: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b': {
      id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      name: 'Dhaka',
      alias: 'ঢাকা',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '7304b306-1b0d-4640-b668-5bf39bc78f48': {
      id: '7304b306-1b0d-4640-b668-5bf39bc78f48',
      name: 'Khulna',
      alias: 'খুলনা',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '75fdf3dc-0dd2-4b65-9c59-3afe5f49fc3a': {
      id: '75fdf3dc-0dd2-4b65-9c59-3afe5f49fc3a',
      name: 'Rajshahi',
      alias: 'রাজশাহী',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '2b55d13f-f700-4373-8255-c0febd4733b6': {
      id: '2b55d13f-f700-4373-8255-c0febd4733b6',
      name: 'Rangpur',
      alias: 'রংপুর',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '59f7f044-84b8-4a6c-955d-271aa3e5af46': {
      id: '59f7f044-84b8-4a6c-955d-271aa3e5af46',
      name: 'Sylhet',
      alias: 'সিলেট',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '237f3404-d417-41fe-9130-3d049800a1e5': {
      id: '237f3404-d417-41fe-9130-3d049800a1e5',
      name: 'Mymensingh',
      alias: 'ময়মনসিংহ',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '7a18cb4c-38f3-449f-b3dc-508473d485f3': {
      id: '7a18cb4c-38f3-449f-b3dc-508473d485f3',
      name: 'Chandpur',
      alias: 'চাঁদপুর',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/5926982b-845c-4463-80aa-cbfb86762e0a'
    },
    'bc4b9f99-0db3-4815-926d-89fd56889407': {
      id: 'bc4b9f99-0db3-4815-926d-89fd56889407',
      name: 'BARGUNA',
      alias: 'বরগুনা',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'dabffdf7-c174-4450-b306-5a3c2c0e2c0e': {
      id: 'dabffdf7-c174-4450-b306-5a3c2c0e2c0e',
      name: 'BARISAL',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'a5b61fc5-f0c9-4f54-a934-eba18f9110c2': {
      id: 'a5b61fc5-f0c9-4f54-a934-eba18f9110c2',
      name: 'BHOLA',
      alias: 'ভোলা',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '5ffa5780-5ddf-4549-a391-7ad3ba2334d4': {
      id: '5ffa5780-5ddf-4549-a391-7ad3ba2334d4',
      name: 'JHALOKATI',
      alias: 'ঝালকাঠি',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'c8dcf1fe-bf92-404b-81c0-31d6802a1a68': {
      id: 'c8dcf1fe-bf92-404b-81c0-31d6802a1a68',
      name: 'PATUAKHALI',
      alias: 'পটুয়াখালী ',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '9c86160a-f704-464a-8b7d-9eae2b4cf1f9': {
      id: '9c86160a-f704-464a-8b7d-9eae2b4cf1f9',
      name: 'PIROJPUR',
      alias: 'পিরোজপুর ',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '1846f07e-6f5c-4507-b5d6-126716b0856b': {
      id: '1846f07e-6f5c-4507-b5d6-126716b0856b',
      name: 'BANDARBAN',
      alias: 'বান্দরবান',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'cf141982-36a1-4308-9090-0445c311f5ae': {
      id: 'cf141982-36a1-4308-9090-0445c311f5ae',
      name: 'BRAHMANBARIA',
      alias: 'ব্রাহ্মণবাড়িয়া',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '478f518e-8d86-439d-8618-5cfa8d3bf5dd': {
      id: '478f518e-8d86-439d-8618-5cfa8d3bf5dd',
      name: 'CHANDPUR',
      alias: 'চাঁদপুর',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'db5faba3-8143-4924-a44a-8562ed5e0437': {
      id: 'db5faba3-8143-4924-a44a-8562ed5e0437',
      name: 'CHITTAGONG',
      alias: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '5926982b-845c-4463-80aa-cbfb86762e0a': {
      id: '5926982b-845c-4463-80aa-cbfb86762e0a',
      name: 'COMILLA',
      alias: 'কুমিল্লা',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'a3455e64-164c-4bf4-b834-16640a85efd8': {
      id: 'a3455e64-164c-4bf4-b834-16640a85efd8',
      name: "COX'S BAZAR",
      alias: 'কক্সবাজার ',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '1dfc716a-c5f7-4d39-ad71-71d2a359210c': {
      id: '1dfc716a-c5f7-4d39-ad71-71d2a359210c',
      name: 'FENI',
      alias: 'ফেনী',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'bfe8306c-0910-48fe-8bf5-0db906cf3155': {
      alias: 'বানিয়াজান',
      id: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
      status: 'active',
      jurisdictionType: 'LOCATION_LEVEL_3',
      name: 'Baniajan',
      partOf: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      type: 'ADMIN_STRUCTURE'
    },
    'd3cef1d4-6187-4f0e-a024-61abd3fce9d4': {
      alias: 'দুওজ',
      id: 'd3cef1d4-6187-4f0e-a024-61abd3fce9d4',
      status: 'active',
      jurisdictionType: 'LOCATION_LEVEL_3',
      name: 'Duaz',
      partOf: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      type: 'ADMIN_STRUCTURE'
    },
    '473ed705-13e8-4ec1-9836-69bc269f7fad': {
      alias: '',
      id: '473ed705-13e8-4ec1-9836-69bc269f7fad',
      status: 'active',
      jurisdictionType: 'STATE',
      name: 'Lusaka',
      partOf: 'Location/0',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      type: 'ADMIN_STRUCTURE'
    },
    '81317429-1d89-42ac-8abc-7a92f268273c': {
      alias: '',
      id: '81317429-1d89-42ac-8abc-7a92f268273c',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      name: 'Lusaka',
      partOf: 'Location/473ed705-13e8-4ec1-9836-69bc269f7fad',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      type: 'ADMIN_STRUCTURE'
    }
  } satisfies Record<string, AdminStructure>,
  languages: languages.data as unknown as ILanguage[],
  templates: templates as unknown as {
    fonts?: CertificateConfiguration['fonts']
    certificates: ICertificateData[]
  },
  assets: {
    logo: `data:image;base64,${validImageB64String}`
  },
  config: {
    APPLICATION_NAME: 'Farajaland CRVS',
    BIRTH: {
      REGISTRATION_TARGET: 45,
      LATE_REGISTRATION_TARGET: 365,
      PRINT_IN_ADVANCE: true
    },
    DEATH: {
      REGISTRATION_TARGET: 45,
      PRINT_IN_ADVANCE: true
    },
    MARRIAGE: {
      REGISTRATION_TARGET: 45,
      PRINT_IN_ADVANCE: true
    },
    FEATURES: {
      DEATH_REGISTRATION: true,
      MARRIAGE_REGISTRATION: true,
      EXTERNAL_VALIDATION_WORKQUEUE: true,
      PRINT_DECLARATION: true,
      DATE_OF_BIRTH_UNKNOWN: true
    },
    HEALTH_FACILITY_FILTER: 'DISTRICT',
    LANGUAGES: 'en,bn',
    FIELD_AGENT_AUDIT_LOCATIONS:
      'WARD,UNION,CITY_CORPORATION,MUNICIPALITY,UPAZILA',
    DECLARATION_AUDIT_LOCATIONS: 'WARD,UNION',
    _id: '61a8c105c04ac94fe46ceb27',
    COUNTRY: 'BGD',
    COUNTRY_LOGO: {
      fileName: 'logo.png',
      // Farajaland Logo
      file: `data:image/png;base64,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`
    },
    LOGIN_BACKGROUND: {
      backgroundColor: 'FFF',
      backgroundImage: '',
      imageFit: 'FILL'
    },
    CURRENCY: {
      isoCode: 'ZMW',
      languagesAndCountry: ['en-ZM']
    },
    PHONE_NUMBER_PATTERN: /^01[1-9][0-9]{8}$/,
    BIRTH_REGISTRATION_TARGET: 45,
    DEATH_REGISTRATION_TARGET: 45,
    NID_NUMBER_PATTERN: /^[0-9]{9}$/,
    SENTRY: 'https://sentry.com',
    USER_NOTIFICATION_DELIVERY_METHOD: 'email',
    INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email',
    SIGNATURE_REQUIRED_FOR_ROLES: ['LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR']
  },
  anonymousConfig: {
    APPLICATION_NAME: 'Farajaland CRVS',
    COUNTRY_LOGO: {
      fileName: 'logo.png',
      file: `data:image;base64,${validImageB64String}`
    },
    LOGIN_BACKGROUND: {
      backgroundColor: 'FFF',
      backgroundImage: '',
      imageFit: 'FILL'
    },
    PHONE_NUMBER_PATTERN: /^01[1-9][0-9]{8}$/
  },
  systems
}

export const mockOfflineLocationsWithHierarchy: {
  facilities: Record<string, Facility>
  offices: Record<string, CRVSOffice>
  locations: Record<string, AdminStructure>
} = {
  facilities: {
    '5c6abc88-26b8-4834-a1a6-2992807e3a72': {
      id: '5c6abc88-26b8-4834-a1a6-2992807e3a72',
      name: 'ARK Private Clinic',
      alias: 'ARK Private Clinic',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/f244b79e-16e7-40b2-834f-c1c57bd7eae8'
    }
  },
  offices: {
    'c9c4d6e9-981c-4646-98fe-4014fddebd5e': {
      id: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
      name: 'Ibombo District Office',
      alias: 'Ibombo District Office',
      physicalType: 'Building',
      statisticalId: '123',
      status: 'active',
      type: 'CRVS_OFFICE',
      partOf: 'Location/ecc5a78b-e7d9-4640-ac65-e591a6a9590f'
    }
  },
  locations: {
    'f244b79e-16e7-40b2-834f-c1c57bd7eae8': {
      id: 'f244b79e-16e7-40b2-834f-c1c57bd7eae8',
      name: 'Abwe',
      alias: 'Abwe',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/df669feb-61a3-4984-ab24-4b28511b472a'
    },
    'ecc5a78b-e7d9-4640-ac65-e591a6a9590f': {
      id: 'ecc5a78b-e7d9-4640-ac65-e591a6a9590f',
      name: 'Ibombo',
      alias: 'Ibombo',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/df669feb-61a3-4984-ab24-4b28511b472a'
    },
    'df669feb-61a3-4984-ab24-4b28511b472a': {
      id: 'df669feb-61a3-4984-ab24-4b28511b472a',
      name: 'Central',
      alias: 'Central',
      physicalType: 'Jurisdiction',
      statisticalId: '123',
      status: 'active',
      jurisdictionType: 'STATE',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  }
}
export const mockOfflineDataWithLocationHierarchy = {
  ...mockOfflineData,
  ...mockOfflineLocationsWithHierarchy
}

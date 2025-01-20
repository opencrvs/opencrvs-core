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

import { create } from 'zustand'
import {
  LanguageSchema,
  ApplicationConfigSchema,
  CertificateDataSchema
} from '@opencrvs/commons/events'
import { storage } from '@client/storage'

interface IApplicationConfig {
  appConfig?: ApplicationConfigSchema
  certificatesTemplate: CertificateDataSchema[]
  language?: LanguageSchema
  initiateAppConfig: () => Promise<void>
}

const isTruthyArray = (value: any) => Array.isArray(value) && value.length > 0

export const useAppConfig = create<IApplicationConfig>((set, get) => ({
  language: undefined,
  appConfig: undefined,
  certificatesTemplate: [],
  initiateAppConfig: async () => {
    try {
      const offlineJsonString = await storage.getItem('offline')
      if (offlineJsonString) {
        const offline = JSON.parse(offlineJsonString)

        if (isTruthyArray(offline['languages'])) {
          const defaultLangue = await storage.getItem('language')
          const defaultLangueObj: LanguageSchema = offline['languages'].find(
            (x: LanguageSchema) => x.lang === defaultLangue
          )
          set({ language: defaultLangueObj })
        }

        if (offline['config']) {
          set({ appConfig: offline['config'] })
        }

        if (
          offline['templates'] &&
          isTruthyArray(offline['templates']['certificates'])
        ) {
          set({ certificatesTemplate: offline['templates']['certificates'] })
        }
      }
    } catch (error) {
      console.error('Error initializing app config:', error)
    }
  }
}))

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
import { api } from '@client/v2-events/trpc'
import { ApplicationConfigResponseSchema } from '@opencrvs/commons/events'
import { UseTRPCQueryResult } from '@trpc/react-query/shared'
import { TRPCClientErrorLike } from '@trpc/client'
import { DefaultErrorShape } from '@trpc/server/unstable-core-do-not-import'

interface IApplicationConfig {
  appConfig: ApplicationConfigResponseSchema
  initiateAppConfig: () => Promise<void>
}

export const useAppConfig = create<IApplicationConfig>((set, get) => ({
  appConfig: { config: undefined, certificates: [] },
  initiateAppConfig: async () => {
    const { data: appConfig } = api.appConfig.get.useQuery()
    set({ appConfig })
  }
}))

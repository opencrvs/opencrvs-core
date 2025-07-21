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

import { route, string } from 'react-router-typesafe-routes/dom'
import { zod } from 'react-router-typesafe-routes/zod'
import { z } from 'zod'

export const routes = route(
  '',
  {},
  {
    WORKQUEUE: route('workqueue', {
      searchParams: {
        id: string(),
        limit: zod(z.number().min(1).max(100)).default(10),
        offset: zod(z.number().min(0)).default(0)
      }
    })
  }
)

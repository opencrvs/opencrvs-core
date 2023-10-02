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
import * as Bunyan from 'bunyan'

export const getLogger = (
  logLevel: number | undefined,
  appName: string | undefined
) => {
  return Bunyan.createLogger({
    name: appName ? appName : 'testApp',
    level: logLevel ? logLevel : 0,
    serializers: Bunyan.stdSerializers
  })
}

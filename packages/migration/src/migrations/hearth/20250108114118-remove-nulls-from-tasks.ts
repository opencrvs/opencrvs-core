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

import { Db } from 'mongodb'

interface IncorrectTask {
  extension: (Record<string, unknown> | null)[]
}

/*
 * Removes nulls from the extension field of Task and Task_history collections.
 */
export const up = async (db: Db) => {
  await db
    .collection<IncorrectTask>('Task')
    .updateMany(
      { extension: { $elemMatch: { $eq: null } } },
      { $pull: { extension: null } }
    )

  await db
    .collection<IncorrectTask>('Task_history')
    .updateMany(
      { extension: { $elemMatch: { $eq: null } } },
      { $pull: { extension: null } }
    )
}

export const down = async () => {}

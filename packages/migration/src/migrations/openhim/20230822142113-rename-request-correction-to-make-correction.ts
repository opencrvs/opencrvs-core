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

import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  await db
    .collection('channels')
    .updateMany({ urlPattern: { $regex: /request-correction/ } }, [
      {
        $set: {
          urlPattern: {
            $replaceOne: {
              input: '$urlPattern',
              find: 'request-correction',
              replacement: 'make-correction'
            }
          }
        }
      }
    ])
}

export const down = async (db: Db, client: MongoClient) => {
  await db
    .collection('channels')
    .updateMany({ urlPattern: { $regex: /request-correction/ } }, [
      {
        $set: {
          urlPattern: {
            $replaceOne: {
              input: '$urlPattern',
              find: 'make-correction',
              replacement: 'request-correction'
            }
          }
        }
      }
    ])
}

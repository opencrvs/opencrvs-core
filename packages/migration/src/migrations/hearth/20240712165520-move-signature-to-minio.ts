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

const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

const employeeSignatureExtensionUrl =
  OPENCRVS_SPECIFICATION_URL + 'extension/employee-signature'

import { Db, MongoClient } from 'mongodb'
import {
  isBase64FileString,
  uploadBase64ToMinio
} from '../../utils/minio-helper.js'

export const up = async (db: Db, client: MongoClient) => {
  const practitioners = db.collection('Practitioner').find({})

  for await (const practitioner of practitioners) {
    const extensions = practitioner.extension

    if (extensions) {
      let signatureUrl = ''
      let type = ''
      for (const extension of extensions) {
        if (extension.url === employeeSignatureExtensionUrl) {
          const signature = extension.valueSignature?.blob
          if (signature && isBase64FileString(signature)) {
            const res = await uploadBase64ToMinio(signature)
            if (typeof res == 'string') {
              signatureUrl = res
              type = extension.valueSignature?.contentType
            }
            break
          }
        }
      }

      if (signatureUrl !== '') {
        db.collection('Practitioner').updateOne(
          {
            id: practitioner.id,
            'extension.url': employeeSignatureExtensionUrl
          },
          {
            $set: {
              'extension.$': {
                url: 'http://opencrvs.org/specs/extension/employee-signature',
                valueAttachment: {
                  contentType: type,
                  url: signatureUrl,
                  creation: new Date().getTime().toString()
                }
              }
            }
          }
        )
      }
    }
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}

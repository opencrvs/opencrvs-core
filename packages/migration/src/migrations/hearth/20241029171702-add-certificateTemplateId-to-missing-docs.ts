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
import { Db, MongoClient } from 'mongodb'

// Define an interface for your DocumentReference
interface DocumentReference {
  _id: string
  extension: Array<{ url: string; valueString?: string }>
  type?: {
    coding?: Array<{ system: string; code: string }>
  }
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const collection = db.collection<DocumentReference>('DocumentReference')
      const documents = await collection.find({}).toArray()

      for (const doc of documents) {
        // Check if certificateTemplateId extension already exists
        const hasCertificateTemplateId = doc.extension.some(
          (ext) =>
            ext.url ===
            'http://opencrvs.org/specs/extension/certificateTemplateId'
        )

        if (!hasCertificateTemplateId) {
          // Determine the certificate type based on `code`
          const certType = doc.type?.coding?.find((x) =>
            x.system.includes('certificate-type')
          )?.code

          let certificateTemplateId: string | null = null

          switch (certType) {
            case 'BIRTH':
              certificateTemplateId = 'birth-certificate'
              break
            case 'DEATH':
              certificateTemplateId = 'death-certificate'
              break
            case 'MARRIAGE':
              certificateTemplateId = 'marriage-certificate'
              break
          }

          if (certificateTemplateId) {
            // Add the missing certificateTemplateId extension
            await collection.updateOne(
              { _id: doc._id },
              {
                $push: {
                  extension: {
                    url: 'http://opencrvs.org/specs/extension/certificateTemplateId',
                    valueString: certificateTemplateId
                  }
                }
              }
            )
            console.log(
              `Updated DocumentReference document with _id: ${doc._id} for missing certificateTemplateId with the extension value ${certificateTemplateId}`
            )
          }
        }
      }
    })
  } catch (error) {
    console.error('Error occurred while updating document references:', error)
    throw error
  } finally {
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const collection = db.collection<DocumentReference>('DocumentReference')

      // Remove the certificateTemplateId extension for each certificate type
      await collection.updateMany(
        {
          extension: {
            $elemMatch: {
              url: 'http://opencrvs.org/specs/extension/certificateTemplateId'
            }
          }
        },
        {
          $pull: {
            extension: {
              url: 'http://opencrvs.org/specs/extension/certificateTemplateId'
            }
          }
        }
      )
      console.log('Reverted certificateTemplateId extension from all documents')
    })
  } catch (error) {
    console.error('Error occurred while reverting document references:', error)
    throw error
  } finally {
    session.endSession()
  }
}

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
export const up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('questions').remove({})
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {
  const session = client.startSession()
  const questions = [
    {
      _id: ObjectId('6343264dda0de688255fe0de'),
      fieldId: 'birth.mother.mother-view-group.phoneNumber',
      label: [
        {
          lang: 'en',
          descriptor: {
            id: 'form.customField.label.phoneNumber',
            description: 'Custom field attribute',
            defaultMessage: 'Phone number'
          }
        }
      ],
      placeholder: [],
      tooltip: [
        {
          lang: 'en',
          descriptor: {
            id: 'form.customField.tooltip.phoneNumber',
            description: 'Custom field attribute',
            defaultMessage: 'Enter a valid number'
          }
        }
      ],
      errorMessage: [],
      maxLength: 11,
      fieldName: 'phoneNumber',
      fieldType: 'TEL',
      precedingFieldId: 'birth.mother.mother-view-group.detailsExist',
      required: true,
      enabled: 'yes',
      custom: true,
      description: []
    },
    {
      _id: ObjectId('6343264dda0de688255fe0df'),
      fieldId: 'birth.father.father-view-group.phoneNumber',
      label: [
        {
          lang: 'en',
          descriptor: {
            id: 'form.customField.label.phoneNumber',
            description: 'Custom field attribute',
            defaultMessage: 'Phone number'
          }
        }
      ],
      placeholder: [],
      description: [],
      tooltip: [
        {
          lang: 'en',
          descriptor: {
            id: 'form.customField.tooltip.phoneNumber',
            description: 'Custom field attribute',
            defaultMessage: 'Enter a valid number'
          }
        }
      ],
      errorMessage: [],
      maxLength: 11,
      fieldName: 'phoneNumber',
      fieldType: 'TEL',
      precedingFieldId: 'birth.father.father-view-group.detailsExist',
      required: true,
      enabled: 'yes',
      custom: true
    }
  ]
  try {
    await session.withTransaction(async () => {
      for (const q of questions) {
        await db.collection('questions').updateMany(
          { fieldId: q.fieldId },
          { $set: q },
          {
            upsert: true
          }
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

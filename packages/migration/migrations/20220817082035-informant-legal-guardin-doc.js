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
          await db.collection('DocumentReference').updateMany(
            { 'subject.display': 'LEGAL_GUARDIAN_PROOF' },
            { $set: { 'type.coding.$[elem].code': 'PROOF_OF_LEGAL_GUARDIANSHIP' } },
            { arrayFilters: [{ 'elem.system': 'http://opencrvs.org/specs/supporting-doc-type' }] }
          )
        });
    } finally {
      await session.endSession()
    }
};

export const down = async (db, client) => {
  const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        await db.collection('DocumentReference').updateMany(
          { 'subject.display': 'LEGAL_GUARDIAN_PROOF' },
          { $set: { 'type.coding.$[elem].code': 'BIRTH_CERTIFICATE' } },
          { arrayFilters: [{ 'elem.system': 'http://opencrvs.org/specs/supporting-doc-type' }] }
        )
      })
    } finally {
      await session.endSession()
    }
};

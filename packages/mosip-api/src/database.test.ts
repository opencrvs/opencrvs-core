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
import test, { it } from 'node:test'
import * as db from './database'
import assert from 'node:assert'

test('SQLite', async () => {
  await it('inserts and removes transactions', () => {
    const { database } = db.initSqlite(':memory:')

    db.insertTransaction('1', 'token1', 'registrationNumber1')
    db.insertTransaction('2', 'token2', 'registrationNumber2')
    db.insertTransaction('3', 'token3', 'registrationNumber3')
    db.insertTransaction('4', 'token4', 'registrationNumber4')

    assert.strictEqual(
      database.prepare('SELECT * FROM transactions').all().length,
      4
    )

    db.getTransactionAndDiscard('1')
    db.getTransactionAndDiscard('2')
    db.getTransactionAndDiscard('3')
    db.getTransactionAndDiscard('4')

    assert.strictEqual(
      database.prepare('SELECT * FROM transactions').all().length,
      0
    )

    db.exit()
  })

  await it('throws on registration number conflict', () => {
    db.initSqlite(':memory:')

    assert.throws(() => {
      db.insertTransaction('2', 'token2', 'registrationNumber1')
      db.insertTransaction('1', 'token1', 'registrationNumber1')
    })

    db.exit()
  })
})

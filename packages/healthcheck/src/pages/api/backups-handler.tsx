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
// pages/backups.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../database'
import Backup, { IBackup } from '../../models/backups'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IBackup[]>
) {
  try {
    await db // Wait for the database connection to be established
    const backups = await Backup.find({}) // Retrieve all backups
    res.status(200).json(backups)
  } catch (error) {
    console.error('Error fetching backups:', error)
    // res.status(500).json({ error: 'Internal Server Error' });
  }
}

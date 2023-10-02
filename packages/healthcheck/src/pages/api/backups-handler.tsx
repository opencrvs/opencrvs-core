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

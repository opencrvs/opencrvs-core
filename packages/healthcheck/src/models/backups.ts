import mongoose, { Schema, Document } from 'mongoose'

export interface IBackup extends Document {
  name: string
  // Add other backup fields as needed
}

const backupSchema: Schema = new Schema({
  name: String
  // Define other backup schema fields here
})

export default mongoose.model<IBackup>('Backup', backupSchema)

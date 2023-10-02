import * as mongoose from 'mongoose'
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/health-check'

mongoose.connect(MONGO_URL)

export const db = mongoose.connection

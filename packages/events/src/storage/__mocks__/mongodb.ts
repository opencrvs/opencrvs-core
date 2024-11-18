import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

let server: MongoMemoryServer
let databaseName = 'records_' + Date.now()

export async function setupServer() {
  server = await MongoMemoryServer.create()
}

export async function resetServer() {
  databaseName = 'records_' + Date.now()
}

export async function getClient() {
  const uri = server.getUri()
  const client = new MongoClient(uri)
  await client.connect()
  return client.db(databaseName)
}

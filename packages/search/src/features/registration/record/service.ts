import { SavedBundle } from '@opencrvs/commons/types'
import { getOrCreateClient } from '@search/elasticsearch/client'
import { deleteComposition } from '@search/elasticsearch/dbhelper'
import { getEventType } from '@search/utils/event'
import { indexRecord as upsertBirthEvent } from '@search/features/registration/birth/service'
import { indexRecord as upsertDeathEvent } from '@search/features/registration/death/service'
import { indexRecord as upsertMarriageEvent } from '@search/features/registration/marriage/service'

export async function deleteRecord(recordId: string) {
  const client = getOrCreateClient()
  return deleteComposition(recordId, client)
}

export async function indexRecord(record: SavedBundle, transactionId?: string) {
  switch (getEventType(record)) {
    case 'BIRTH':
      return upsertBirthEvent(record, transactionId)
    case 'DEATH':
      return upsertDeathEvent(record, transactionId)
    case 'MARRIAGE':
      return upsertMarriageEvent(record, transactionId)
    default:
      throw new Error('Unsupported event type')
  }
}

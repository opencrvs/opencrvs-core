import { sortEventsForWorkqueue } from './SearchResultComponent'
import { SORT_ORDER } from '@opencrvs/components/lib/Workqueue'

// Rebuild the same COLUMNS object shape used in SearchResultComponent
// (or export COLUMNS from there and import it instead, if allowed)
const COLUMNS = {
  LAST_UPDATED: 'updatedAt'
} as const

describe('sortEventsForWorkqueue - time columns', () => {
  const data = [
    { id: 'a', updatedAt: '2023-01-03T10:00:00Z' }, // latest
    { id: 'b', updatedAt: '2023-01-01T10:00:00Z' }, // earliest
    { id: 'c', updatedAt: '2023-01-02T10:00:00Z' }  // middle
  ]

  it('sorts LAST_UPDATED ascending from earliest to latest', () => {
    const result = sortEventsForWorkqueue(
      data,
      COLUMNS.LAST_UPDATED,
      SORT_ORDER.ASCENDING
    )

    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts LAST_UPDATED descending from latest to earliest', () => {
    const result = sortEventsForWorkqueue(
      data,
      COLUMNS.LAST_UPDATED,
      SORT_ORDER.DESCENDING
    )

    expect(result.map((r) => r.id)).toEqual(['a', 'c', 'b'])
  })
})

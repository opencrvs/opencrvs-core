import { resolvers } from './type-resolvers'

describe('birth registration by age metrics', () => {
  it('returns birth registration by age label', () => {
    const dataToResolve = { label: '45d', value: 200 }

    const resolvedData = resolvers.BirthRegistrationByAgeMetrics.label(
      dataToResolve
    )
    expect(resolvedData).toEqual('45d')
  })
  it('returns birth registration by age value', () => {
    const dataToResolve = { label: '45d', value: 200 }

    const resolvedData = resolvers.BirthRegistrationByAgeMetrics.value(
      dataToResolve
    )
    expect(resolvedData).toEqual(200)
  })
})

import { pushTrackingId } from './fhir-bundle-modifier'
import { OPENCRVS_SPECIFICATION_URL } from './constants'
import { sampleFhirBundle } from './constants'

describe('Verify pushTrackingId function', () => {
  it('Successfully modified the provided fhirBundle with trackingid', () => {
    const fhirBundle = pushTrackingId(sampleFhirBundle)
    const composition = fhirBundle.entry[0].resource as fhir.Composition
    const task = fhirBundle.entry[1].resource as fhir.Task

    expect(composition.identifier.value).toMatch(/^B/)
    expect(composition.identifier.value.length).toBe(7)
    expect(task.identifier[0]).toEqual({
      system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
      value: composition.identifier.value
    })
  })

  it('Throws error if invalid fhir bundle is provided', () => {
    const invalidData = { ...sampleFhirBundle, entry: [] }
    expect(() => pushTrackingId(invalidData)).toThrowError(
      'Invalid FHIR bundle found for declration'
    )
  })

  it('Will push the composite resource identifier if it is missing on fhirDoc', () => {
    const fhirBundle = pushTrackingId({
      ...sampleFhirBundle,
      entry: [{ resource: {} }]
    })
    const composition = fhirBundle.entry[0].resource as fhir.Composition

    expect(composition.identifier.value).toMatch(/^B/)
    expect(composition.identifier.value.length).toBe(7)
  })
})

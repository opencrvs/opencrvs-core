import { TransformedData } from '@register/forms'
import { birthEventLocationMutationTransformer } from './child-mappings'

describe('Child section mutation mapping related tests', () => {
  it('Test birthLocation search field', () => {
    const transformedData: TransformedData = {
      child: {}
    }
    const draftData = {
      child: {
        birthLocation: {
          label: 'Health institute',
          value: '54538456-fcf6-4276-86ac-122a7eb47703'
        }
      }
    }
    birthEventLocationMutationTransformer(0)(
      transformedData,
      draftData,
      'child',
      // @ts-ignore
      {
        name: 'birthLocation',
        type: 'SEARCH_FIELD'
      }
    )
    expect(transformedData.child).toBeDefined()
    expect(transformedData.eventLocation._fhirID).toEqual(
      '54538456-fcf6-4276-86ac-122a7eb47703'
    )
  })
})

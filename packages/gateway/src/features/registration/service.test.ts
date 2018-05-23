import { toFHIR } from './service'

test('should build a correct FHIR registration document without error', () => {
  const fhir = toFHIR({
    mother: {
      gender: 'female',
      name: [{ givenName: 'Jane', familyName: 'Doe' }]
    },
    father: { gender: 'male', name: [] },
    child: { gender: 'male', name: [] },
    createdAt: new Date()
  })
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(3)
  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[2].resource.gender).toBe('male')
  expect(fhir.entry[3].resource.gender).toBe('male')
  expect(fhir.entry[1].resource.name[0].given[0]).toBe('Jane')
  expect(fhir.entry[1].resource.name[0].family[0]).toBe('Doe')
})

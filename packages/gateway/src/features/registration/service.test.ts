import * as fs from 'fs'
import { fromFHIR, toFHIR } from './service'

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

test('should build a correct GraphQL object from FHIR', () => {
  const obj = fromFHIR(
    JSON.parse(
      fs.readFileSync(`${__dirname}/composition-resolved.test.json`).toString()
    )
  )
  expect(obj).toBeDefined()
  expect(obj).toMatchObject([
    {
      id: '58247325-51e8-4bed-ad61-c2854bdd7b13',
      mother: {
        gender: 'female',
        name: [
          {
            givenName: 'Jane',
            familyName: 'Doe'
          }
        ]
      },
      father: {
        gender: 'male',
        name: [
          {
            givenName: 'Jack',
            familyName: 'Doe'
          }
        ]
      },
      child: {
        gender: 'male',
        name: [
          {
            givenName: 'Baby',
            familyName: 'Doe'
          }
        ]
      },
      createdAt: '2018-05-23T14:44:58+02:00'
    }
  ])
})

import { buildFHIRBundle } from 'src/features/registration/fhir-builders'
import {
  FHIR_SPECIFICATION_URL,
  OPENCRVS_SPECIFICATION_URL
} from 'src/features/fhir/constants'

test('should build a minimal FHIR registration document without error', async () => {
  const fhir = await buildFHIRBundle({
    mother: {
      identifier: [{ id: '123456', type: 'PASSPORT' }],
      gender: 'female',
      birthDate: '2000-01-28',
      maritalStatus: 'MARRIED',
      name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'english' }],
      deceased: false,
      multipleBirth: 1,
      dateOfMarriage: '2014-01-28',
      nationality: ['BGD'],
      educationalAttainment: 'UPPER_SECONDARY_ISCED_3'
    },
    father: {
      gender: 'male',
      name: [],
      telecom: [{ use: 'mobile', system: 'phone', value: '0171111111' }],
      maritalStatus: 'MARRIED',
      birthDate: '2000-09-28',
      deceased: false,
      multipleBirth: 2,
      address: [
        {
          use: 'home',
          type: 'both',
          line: ['2760 Mlosi Street', 'Wallacedene'],
          district: 'Kraaifontein',
          state: 'Western Cape',
          city: 'Cape Town',
          postalCode: '7570',
          country: 'BGD'
        },
        {
          use: 'home',
          type: 'both',
          line: ['40 Orbis Wharf', 'Wallacedene'],
          text: 'Optional address text',
          district: 'Kraaifontein',
          state: 'Western Cape',
          city: 'Cape Town',
          postalCode: '7570',
          country: 'BGD'
        }
      ],
      photo: [
        {
          contentType: 'image/jpeg',
          data: '123456',
          title: 'father-national-id'
        }
      ],
      dateOfMarriage: '2014-01-28',
      nationality: ['BGD'],
      educationalAttainment: 'UPPER_SECONDARY_ISCED_3'
    },
    child: {
      gender: 'male',
      name: [],
      birthDate: '2018-01-28',
      maritalStatus: 'NOT_STATED',
      deceased: false,
      multipleBirth: 3,
      dateOfMarriage: '',
      nationality: ['BGD'],
      educationalAttainment: 'NO_SCHOOLING'
    },
    createdAt: new Date()
  })
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(3)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[2].resource.gender).toBe('male')
  expect(fhir.entry[3].resource.gender).toBe('male')
  expect(fhir.entry[1].resource.name[0].given[0]).toBe('Jane')
  expect(fhir.entry[1].resource.name[0].family[0]).toBe('Doe')
  expect(fhir.entry[1].resource.name[0].use).toBe('english')
  expect(fhir.entry[1].resource.identifier[0].id).toBe('123456')
  expect(fhir.entry[1].resource.identifier[0].type).toBe('PASSPORT')
  expect(fhir.entry[2].resource.telecom[0].value).toBe('0171111111')
  expect(fhir.entry[2].resource.telecom[0].system).toBe('phone')
  expect(fhir.entry[2].resource.telecom[0].use).toBe('mobile')
  expect(fhir.entry[1].resource.birthDate).toBe('2000-01-28')
  expect(fhir.entry[2].resource.birthDate).toBe('2000-09-28')
  expect(fhir.entry[3].resource.birthDate).toBe('2018-01-28')
  expect(fhir.entry[2].resource.maritalStatus.text).toBe('MARRIED')
  expect(fhir.entry[1].resource.maritalStatus.text).toBe('MARRIED')
  expect(fhir.entry[3].resource.maritalStatus.text).toBe('NOT_STATED')
  expect(fhir.entry[2].resource.maritalStatus.coding.code).toBe('M')
  expect(fhir.entry[1].resource.maritalStatus.coding.code).toBe('M')
  expect(fhir.entry[3].resource.maritalStatus.coding.code).toBe('UNK')
  expect(fhir.entry[1].resource.multipleBirthInteger).toBe(1)
  expect(fhir.entry[2].resource.multipleBirthInteger).toBe(2)
  expect(fhir.entry[3].resource.multipleBirthInteger).toBe(3)
  expect(fhir.entry[1].resource.deceasedBoolean).toBe(false)
  expect(fhir.entry[2].resource.deceasedBoolean).toBe(false)
  expect(fhir.entry[3].resource.deceasedBoolean).toBe(false)
  expect(fhir.entry[2].resource.photo[0].title).toBe('father-national-id')
  expect(fhir.entry[2].resource.address[0].use).toBe('home')
  expect(fhir.entry[2].resource.address[0].line[0]).toBe('2760 Mlosi Street')
  expect(fhir.entry[2].resource.address[1].line[0]).toBe('40 Orbis Wharf')
  expect(fhir.entry[2].resource.address[1].text).toBe('Optional address text')
  expect(fhir.entry[1].resource.extension[0].valueDateTime).toBe('2014-01-28')
  expect(fhir.entry[1].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: { system: 'urn:iso:std:iso:3166', code: 'BGD' }
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[1].resource.extension[2].valueString).toBe(
    'UPPER_SECONDARY_ISCED_3'
  )
  expect(fhir.entry[1].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}educational-attainment`
  )
  expect(fhir.entry[1].resource.extension[0].valueDateTime).toBe('2014-01-28')
  expect(fhir.entry[2].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: { system: 'urn:iso:std:iso:3166', code: 'BGD' }
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[2].resource.extension[2].valueString).toBe(
    'UPPER_SECONDARY_ISCED_3'
  )
  expect(fhir.entry[2].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}educational-attainment`
  )
  expect(fhir.entry[3].resource.extension[0].valueDateTime).toBe('')
  expect(fhir.entry[3].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: { system: 'urn:iso:std:iso:3166', code: 'BGD' }
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[3].resource.extension[2].valueString).toBe('NO_SCHOOLING')
  expect(fhir.entry[3].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}educational-attainment`
  )
})

export const mockPatient = {
  resourceType: 'Patient',
  active: true,
  identifier: [
    {
      use: 'official',
      system: '',
      value: ''
    }
  ],
  name: [
    {
      use: 'official',
      prefix: ['Mr'],
      family: ['Matinyana'],
      given: ['Charlton', 'Joseph']
    }
  ],
  gender: 'male',
  birthDate: '1970-07-21',
  telecom: [
    {
      use: '',
      system: 'email',
      value: 'charlton@email.com'
    },
    {
      use: 'mobile',
      system: 'phone',
      value: '27831234567'
    }
  ],
  address: [
    {
      use: 'home',
      type: 'both',
      line: ['2760 Mlosi Street', 'Wallacedene', 'Kraaifontein'],
      state: 'Western Cape',
      city: 'Cape Town',
      postalCode: '7570',
      period: {
        start: '',
        end: ''
      }
    }
  ],
  maritalStatus: {
    coding: {
      system: 'http://hl7.org/fhir/ValueSet/marital-status',
      code: 'M'
    },
    text: 'Married'
  },
  multipleBirthInteger: 1, // the number is the birth number in the sequence. E.g. The middle birth in tripplets would be valueInteger=2 and the third born would have valueInteger=3
  photo: [
    {
      contentType: '',
      data: '<base64Binary>'
    }
  ],
  deceasedBoolean: 'false',
  communication: [
    {
      language: {
        coding: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en'
          }
        ],
        text: 'English'
      },
      preferred: true
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
      extension: [
        {
          url: 'code',
          valueCodeableConcept: {
            coding: { system: 'urn:iso:std:iso:3166', code: 'BN' }
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
    },
    {
      url: 'http://opencrvs.org/specs/extension/date-of-marriage',
      valueDateTime: '2014-01-28'
    },
    {
      url: 'http://opencrvs.org/specs/extension/educational-attainment',
      valueString: 'SECOND_STAGE_TERTIARY_ISCED_6'
    },
    {
      url: 'http://opencrvs.org/specs/extension/migrant-status',
      valueString: 'RESIDENT'
    }
  ],
  link: [
    {
      type: 'also-see',
      other: {
        reference: 'RelatedPerson/123' // for mother and father for fhir relationship links
      }
    }
  ]
}

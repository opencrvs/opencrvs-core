export const testFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '0ab5e4cd-a49b-4bf3-b03a-08b2e65e642a'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-declaration'
            }
          ],
          text: 'Birth Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        subject: {},
        date: '2018-05-23T14:44:58+02:00',
        author: [],
        title: 'Birth Declaration',
        section: [
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              {
                reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662'
              }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              {
                reference: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            entry: [
              {
                reference: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221'
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'birth-registration'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12345678'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            family: ['অনিক'],
            given: ['অনিক'],
            use: 'bn'
          }
        ],
        gender: 'male'
      }
    },
    {
      fullUrl: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jane'],
            family: ['Doe']
          }
        ],
        gender: 'female',
        telecom: [
          {
            system: 'phone',
            value: '+8801622688231'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jack'],
            family: ['Doe']
          }
        ],
        gender: 'male'
      }
    }
  ]
}

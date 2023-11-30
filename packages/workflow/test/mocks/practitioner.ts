import { Practitioner } from '@opencrvs/commons/types'

export const practitioner: Practitioner = {
  resourceType: 'Practitioner',
  identifier: [],
  telecom: [
    {
      system: 'phone',
      value: '0911111111'
    },
    {
      system: 'email',
      value: ''
    }
  ],
  name: [
    {
      use: 'en',
      family: 'Bwalya',
      given: ['Kalusha']
    }
  ],
  meta: {
    lastUpdated: '2023-11-29T07:02:39.305+00:00',
    versionId: '4b7aa336-8922-45e3-b1d4-45e25e3d5a6a'
  },
  id: '4651d1cc-6072-4e34-bf20-b583f421a9f1'
}

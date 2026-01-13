/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  UUID,
  LocationType,
  Location,
  AdministrativeArea
} from '@opencrvs/commons/client'

/*
 * Central
 * | -- Central Provincial Office
 * | --- Ibombo
 *    | -- Chamakubi Health Post
 *    | -- Ibombo Rural Health Centre
 *    | -- Chikobo Rural Health Centre
 *    | -- Chilochabalenje Health Post
 *    | -- Chipeso Rural Health Centre
 *    | -- Chisamba Rural Health Centre
 *    | -- Chitanda Rural Health Centre
 *    | -- Golden Valley Rural Health Centre
 *    | -- Ipongo Rural Health Centre
 *    | -- Itumbwe Health Post
 *    | -- Kabangalala Rural Health Centre
 *    | -- Ibombo District Office
 *    | -- Isamba District Office
 * | --- Isango
 *    | -- Isango District Office
 * | --- Isamba
 * | --- Itambo
 * | --- Ezhi
 * Sulaka
 * | -- Sulaka Provincial Office
 * | --- Ilanga
 *    | -- Ilanga District Office
 * Pualula
 * Chuminga
 */

export const V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS: AdministrativeArea[] = [
  {
    id: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    name: 'Central',
    parentId: null,
    validUntil: null,
    externalId: 'ydyJb1RAy4U1'
  },
  {
    id: 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID,
    name: 'Sulaka',
    parentId: null,
    validUntil: null,
    externalId: 'pQ8nGxWmZ2Q3'
  },
  {
    id: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64' as UUID,
    name: 'Pualula',
    parentId: null,
    validUntil: null,
    externalId: 'Aq91DweLmT8k'
  },
  {
    id: '6d1a59df-988c-4021-a846-ccbc021931a7' as UUID,
    name: 'Chuminga',
    parentId: null,
    validUntil: null,
    externalId: 'Rw0fYNh2Xk9a'
  },
  {
    id: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    name: 'Ibombo',
    parentId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'k7DsP4vbN1Qe'
  },
  {
    id: '27160bbd-32d1-4625-812f-860226bfb92a' as UUID,
    name: 'Isango',
    parentId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'Gm3Z9eQpHw4L'
  },
  {
    id: '967032fd-3f81-478a-826c-30cb8fe121bd' as UUID,
    name: 'Isamba',
    parentId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'sT0xVu1KqJ7r'
  },
  {
    id: '89a33893-b17d-481d-a26d-6461e7ac1651' as UUID,
    name: 'Itambo',
    parentId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'Nq6Bv2HpL9Te'
  },
  {
    id: 'd42ab2fe-e7ed-470e-8b31-4fb27f9b8250' as UUID,
    name: 'Ezhi',
    parentId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'xK8cQ0ZRy5Wd'
  },
  {
    id: '8fbd09d2-212b-47f4-beb3-5e1694931d9f' as UUID,
    name: 'Ilanga',
    parentId: 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID,
    validUntil: null,
    externalId: 'Cq4Jm1XvN8Ls'
  }
]
export const V2_DEFAULT_MOCK_LOCATIONS: Location[] = [
  {
    id: '423d000f-101b-47c0-8b86-21a908067cee' as UUID,
    name: 'Chamakubi Health Post',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'M1nFr8LbC2Qy'
  },
  {
    id: '4d3279be-d026-420c-88f7-f0a4ae986973' as UUID,
    name: 'Ibombo Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'bT7pV6YrW0Xc'
  },
  {
    id: '190902f4-1d77-476a-8947-41145af1db7d' as UUID,
    name: 'Chikobo Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'zE4qPn2SgJ5d'
  },
  {
    id: 'f5ecbd9b-a01e-4a65-910e-70e86ab41b71' as UUID,
    name: 'Chilochabalenje Health Post',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'H8vDs1MqR4Uf'
  },
  {
    id: 'dbfc178f-7295-4b90-b28d-111c95b03127' as UUID,
    name: 'Chipeso Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Qw3uZ9KfX6Lm'
  },
  {
    id: '09862bfe-c7ac-46cd-987b-668681533c80' as UUID,
    name: 'Chisamba Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Yr0pCg8LdM2s'
  },
  {
    id: '834ce389-e95b-4fb0-96a0-33e9ab323059' as UUID,
    name: 'Chitanda Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'tS9gJ4PwB1Qx'
  },
  {
    id: '0431c433-6062-4a4c-aee9-25271aec61ee' as UUID,
    name: 'Golden Valley Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Ld7Qm3XsA8Vr'
  },
  {
    id: 'bc84d0b6-7ba7-480d-a339-5d9920d90eb2' as UUID,
    name: 'Ipongo Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'kF2sW9DmH0Bt'
  },
  {
    id: '4cf1f53b-b730-41d2-8649-dff7eeed970d' as UUID,
    name: 'Itumbwe Health Post',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Ue5Xb3VaC7Pq'
  },
  {
    id: '4b3676cb-9355-4942-9eb9-2ce46acaf0e0' as UUID,
    name: 'Kabangalala Rural Health Centre',
    locationType: LocationType.enum.HEALTH_FACILITY,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Pz8Kc1TqH6Jn'
  },
  {
    id: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID,
    name: 'Central Provincial Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
    validUntil: null,
    externalId: 'Xr3Df8WpK6Ys'
  },
  {
    id: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
    name: 'Ibombo District Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
    validUntil: null,
    externalId: 'Sm4Nw7GrD2Vy'
  },
  {
    id: '62a0ccb4-4f30-4f30-8882-f256007dff9f' as UUID,
    name: 'Isamba District Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: '967032fd-3f81-478a-826c-30cb8fe121bd' as UUID,
    validUntil: null,
    externalId: 'Vg1Bq5XeH9Lt'
  },
  {
    id: '954c93e1-13f7-4435-bb82-35e0e215e07d' as UUID,
    name: 'Isango District Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: '27160bbd-32d1-4625-812f-860226bfb92a' as UUID,
    validUntil: null,
    externalId: 'Je7Lm2XqN9Vz'
  },
  {
    id: '2884f5b9-17b4-49ce-bf4d-f538228935df' as UUID,
    name: 'Sulaka Provincial Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID,
    validUntil: null,
    externalId: 'Ht2Wp9KcX5Qv'
  },
  {
    id: '030358c6-54af-44be-821b-8e4af963a49c' as UUID,
    name: 'Ilanga District Office',
    locationType: LocationType.enum.CRVS_OFFICE,
    administrativeAreaId: '8fbd09d2-212b-47f4-beb3-5e1694931d9f' as UUID,
    validUntil: null,
    externalId: 'Yp6Ds1WqN3Xz'
  }
]

export const V2_DEFAULT_MOCK_LOCATIONS_MAP = new Map(
  V2_DEFAULT_MOCK_LOCATIONS.map((l) => [l.id, l])
)

export const V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP = new Map(
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS.map((a) => [a.id, a])
)

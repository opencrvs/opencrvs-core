/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

// In the absence of BBS codes in the DHIS2 pilot, we must match facility union
// and pourosava names against the english names then get details with a2iRef

export interface Ia2ILocationRefences {
  name: string
  a2iRef: string
}
export const pilotUnions: Ia2ILocationRefences[] = [
  // Narsingdi unions:
  { name: 'Alokbali', a2iRef: 'division=3&district=29&upazila=229&union=4143' },
  {
    name: 'Amdia',
    a2iRef: 'division=3&district=29&upazila=229&union=4144'
  },
  {
    name: 'Char Dighaldi',
    a2iRef: 'division=3&district=29&upazila=229&union=4145'
  },
  {
    name: 'Chinishpur',
    a2iRef: 'division=3&district=29&upazila=229&union=4146'
  },
  { name: 'Hajipur', a2iRef: 'division=3&district=29&upazila=229&union=4147' },
  { name: 'Karimpur', a2iRef: 'division=3&district=29&upazila=229&union=4148' },
  {
    name: 'Kanthalia',
    a2iRef: 'division=3&district=29&upazila=229&union=4149'
  },
  {
    name: 'Nuralla Pur U/c',
    a2iRef: 'division=3&district=29&upazila=229&union=4150'
  },
  {
    name: 'Mahishasura',
    a2iRef: 'division=3&district=29&upazila=229&union=4151'
  },
  {
    name: 'Meher Para',
    a2iRef: 'division=3&district=29&upazila=229&union=4152'
  },
  { name: 'Nazarpur', a2iRef: 'division=3&district=29&upazila=229&union=4153' },
  {
    name: 'Paikarchar',
    a2iRef: 'division=3&district=29&upazila=229&union=4154'
  },
  {
    name: 'Panchdona',
    a2iRef: 'division=3&district=29&upazila=229&union=4155'
  },
  { name: 'Silmandi', a2iRef: 'division=3&district=29&upazila=229&union=4156' },
  // Bhurungamari unions:
  {
    name: 'Andhari Jhar',
    a2iRef: 'division=6&district=55&upazila=413&union=736'
  },
  {
    name: 'Bhurungamari',
    a2iRef: 'division=6&district=55&upazila=413&union=737'
  },
  { name: 'Boldia', a2iRef: 'division=6&district=55&upazila=413&union=738' },
  {
    name: 'Bangasonahat',
    a2iRef: 'division=6&district=55&upazila=413&union=739'
  },
  {
    name: 'Char Bhurungamari',
    a2iRef: 'division=6&district=55&upazila=413&union=740'
  },
  {
    name: 'Joymanirhat',
    a2iRef: 'division=6&district=55&upazila=413&union=741'
  },
  {
    name: 'Paiker Chhara',
    a2iRef: 'division=6&district=55&upazila=413&union=742'
  },
  {
    name: 'Pathardubi',
    a2iRef: 'division=6&district=55&upazila=413&union=743'
  },
  { name: 'Shilkhuri', a2iRef: 'division=6&district=55&upazila=413&union=744' },
  { name: 'Tilai', a2iRef: 'division=6&district=55&upazila=413&union=745' }
]
export const pilotMunicipalities: Ia2ILocationRefences[] = [
  {
    name: 'Madhabdi Paurashava', // TODO:  Not able to find any health facilities for this paurashava
    a2iRef: 'division=3&district=29&upazila=229&municipality=OpenCRVS_1'
  },
  {
    name: 'Narsingdi Paurashava',
    a2iRef: 'division=3&district=29&upazila=229&municipality=OpenCRVS_2'
  }
]

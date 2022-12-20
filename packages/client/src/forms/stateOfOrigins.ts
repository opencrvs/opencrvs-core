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
import { ISelectOption } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'

export const STATE_OF_ORIGINS: ISelectOption[] = [
  { value: 'Abia', label: formMessageDescriptors.abia },
  { value: 'Adamawa', label: formMessageDescriptors.adamawa },
  { value: 'Akwa Ibom', label: formMessageDescriptors.akwa },
  { value: 'Anambra', label: formMessageDescriptors.anambra },
  { value: 'Bauchi', label: formMessageDescriptors.bauchi },
  { value: 'Bayelsa', label: formMessageDescriptors.bayelsa },
  { value: 'Benue', label: formMessageDescriptors.benue },
  { value: 'Borno', label: formMessageDescriptors.borno },
  { value: 'Cross River', label: formMessageDescriptors.cross },
  { value: 'Delta', label: formMessageDescriptors.delta },
  { value: 'Ebonyi', label: formMessageDescriptors.ebonyi },
  { value: 'Edo', label: formMessageDescriptors.edo },
  { value: 'Ekiti', label: formMessageDescriptors.ekiti },
  { value: 'Enugu', label: formMessageDescriptors.enugu },
  {
    value: 'Federal Capital Territory',
    label: formMessageDescriptors.federal
  },
  { value: 'Gombe', label: formMessageDescriptors.gombe },
  { value: 'Imo', label: formMessageDescriptors.imo },
  { value: 'Jigawa', label: formMessageDescriptors.jigawa },
  { value: 'Kaduna', label: formMessageDescriptors.kaduna },
  { value: 'Kano', label: formMessageDescriptors.kano },
  { value: 'Katsina', label: formMessageDescriptors.katsina },
  { value: 'Kebbi', label: formMessageDescriptors.kebbi },
  { value: 'Kogi', label: formMessageDescriptors.kogi },
  { value: 'Kwara', label: formMessageDescriptors.kwara },
  { value: 'Lagos', label: formMessageDescriptors.lagos },
  { value: 'Nasarawa', label: formMessageDescriptors.nasarawa },
  { value: 'Niger', label: formMessageDescriptors.niger },
  { value: 'Ogun', label: formMessageDescriptors.ogun },
  { value: 'Ondo', label: formMessageDescriptors.ondo },
  { value: 'Osun', label: formMessageDescriptors.osun },
  { value: 'Oyo', label: formMessageDescriptors.oyo },
  { value: 'Plateau', label: formMessageDescriptors.plateau },
  { value: 'Rivers', label: formMessageDescriptors.rivers },
  { value: 'Sokoto', label: formMessageDescriptors.sokoto },
  { value: 'Taraba', label: formMessageDescriptors.taraba },
  { value: 'Yobe', label: formMessageDescriptors.yobe },
  { value: 'Zamfara', label: formMessageDescriptors.zamfara }
]

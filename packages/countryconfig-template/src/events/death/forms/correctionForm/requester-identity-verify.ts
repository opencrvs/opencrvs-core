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
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not,
  or
} from '@opencrvs/toolkit/events'

export const deathcorrectionRequesterIdentityVerify: FieldConfig[] = [
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('requester.type').isEqualTo('SPOUSE'),
          and(
            field('requester.type').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo('SPOUSE')
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.death.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'spouse.idType' },
        { fieldId: 'spouse.nid' },
        { fieldId: 'spouse.passport' },
        { fieldId: 'spouse.brn' },
        { fieldId: 'spouse.name' },
        { fieldId: 'spouse.dob' },
        { fieldId: 'spouse.age' },
        { fieldId: 'spouse.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('INFORMANT'),
          not(field('informant.relation').isEqualTo('SPOUSE'))
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.death.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'informant.idType' },
        { fieldId: 'informant.nid' },
        { fieldId: 'informant.passport' },
        { fieldId: 'informant.brn' },
        { fieldId: 'informant.name' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.age' },
        { fieldId: 'informant.nationality' }
      ]
    }
  }
]

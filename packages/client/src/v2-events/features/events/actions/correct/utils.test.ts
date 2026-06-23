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

import { describe, expect, it } from 'vitest'
import { EventState } from '@opencrvs/commons/client'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { getDeclarationFields } from '@opencrvs/commons/client'
import { getChangedDeclarationDiff } from './utils'

const fields = getDeclarationFields(tennisClubMembershipEvent)
const eventConfiguration = tennisClubMembershipEvent
const validatorContext = {}

describe('getChangedDeclarationDiff', () => {
  it('includes a cleared field even when it is missing from form state', () => {
    const previousFormValues: EventState = {
      'applicant.email': 'jane@example.com'
    }
    const form: EventState = {}

    const result = getChangedDeclarationDiff(
      fields,
      form,
      previousFormValues,
      eventConfiguration,
      validatorContext
    )

    expect(result).toEqual({ 'applicant.email': null })
  })

  it('does not include unchanged fields', () => {
    const previousFormValues: EventState = {
      'applicant.email': 'jane@example.com'
    }
    const form: EventState = {
      'applicant.email': 'jane@example.com'
    }

    const result = getChangedDeclarationDiff(
      fields,
      form,
      previousFormValues,
      eventConfiguration,
      validatorContext
    )

    expect(result).toEqual({})
  })
})

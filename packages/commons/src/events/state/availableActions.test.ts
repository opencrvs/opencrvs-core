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
import { EventStatus, InherentFlags } from '../EventMetadata'
import { getAvailableActions } from './availableActions'

describe('getAvailableActions', () => {
  for (const status of EventStatus.options) {
    it(`should return the correct actions for "${status}" status with no flags`, () => {
      expect(getAvailableActions(status as EventStatus, [])).toMatchSnapshot()
    })
  }

  const REJECTABLE_STATUSES = [
    EventStatus.Enum.NOTIFIED,
    EventStatus.Enum.DECLARED,
    EventStatus.Enum.VALIDATED
  ]

  for (const status of REJECTABLE_STATUSES) {
    it(`should return the correct actions for "${status}" status with ${InherentFlags.REJECTED} flag`, () => {
      expect(
        getAvailableActions(status as EventStatus, [InherentFlags.REJECTED])
      ).toMatchSnapshot()
    })
  }

  it(`should return the correct actions for "${EventStatus.Enum.REGISTERED}" status with ${InherentFlags.CORRECTION_REQUESTED} flag`, () => {
    expect(
      getAvailableActions(EventStatus.Enum.REGISTERED, [
        InherentFlags.CORRECTION_REQUESTED
      ])
    ).toMatchSnapshot()
  })
})

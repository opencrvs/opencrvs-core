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
import { field, and, or, not } from '@opencrvs/toolkit/events/deduplication'

const similarNamedDeceased = field('deceased.name').fuzzyMatches()

const differentDeceasedIdTypes = not(field('deceased.idType').strictMatches())
const deceasedIdNotProvided = field('deceased.idType').strictMatches({
  value: 'NONE'
})
const deceasedIdMatchesIfGiven = or(
  differentDeceasedIdTypes,
  deceasedIdNotProvided,
  field('deceased.nid').strictMatches(),
  field('deceased.passport').strictMatches(),
  field('deceased.brn').strictMatches()
)

const deceasedDateOfDeathWithin5Days = field(
  'eventDetails.date'
).dateRangeMatches({
  days: 5
})
const similarDeceasedDob = field('deceased.dob').dateRangeMatches({ days: 365 })

export const dedupConfig = and(
  similarNamedDeceased,
  deceasedIdMatchesIfGiven,
  deceasedDateOfDeathWithin5Days,
  similarDeceasedDob
)

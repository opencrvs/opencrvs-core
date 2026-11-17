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

const similarNamedChild = field('child.name').fuzzyMatches()
const childDobWithin5Days = field('child.dob').dateRangeMatches({ days: 5 })
const similarNamedMother = field('mother.name').fuzzyMatches()
const similarAgedMother = or(
  field('mother.dob').dateRangeMatches({
    days: 365
  }),
  field('mother.age').dateRangeMatches({
    days: 365
  }),
  field('mother.dob').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.age'
  }),
  field('mother.age').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.dob'
  })
)

const differentMotherIdTypes = not(field('mother.idType').strictMatches())
const motherIdNotProvided = field('mother.idType').strictMatches({
  value: 'NONE'
})
const motherIdMatchesIfGiven = or(
  differentMotherIdTypes,
  motherIdNotProvided,
  field('mother.nid').strictMatches(),
  field('mother.passport').strictMatches(),
  field('mother.brn').strictMatches(),
  field('mother.verified').strictMatches({
    value: 'authenticated'
  })
)

const childDobWithin9Months = field('child.dob').dateRangeMatches({
  days: 270
})
const childDobWithin3Years = field('child.dob').dateRangeMatches({
  days: 1095
})
const exactNamedChild = field('child.name').strictMatches()

export const dedupConfig = or(
  and(
    similarNamedChild,
    childDobWithin5Days,
    similarNamedMother,
    similarAgedMother,
    motherIdMatchesIfGiven
  ),
  and(
    similarNamedMother,
    similarAgedMother,
    motherIdMatchesIfGiven,
    childDobWithin9Months
  ),
  and(
    exactNamedChild,
    childDobWithin3Years,
    similarNamedMother,
    similarAgedMother,
    motherIdMatchesIfGiven
  )
)

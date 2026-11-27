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
    days: 365,
    matchAgainst: ['mother.dob', 'mother.age']
  }),
  field('mother.age').dateRangeMatches({
    days: 365,
    matchAgainst: ['mother.age', 'mother.dob']
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

/**
 * The initial version keeps the father's name in 2 TEXT fields, and v2 keeps it in the NAME
 * field `father.name`. Each part is matched against the TEXT field and the NAME field, so a
 * record of the initial version finds the records of both versions.
 */
const similarNamedFather = and(
  field('father.firstname').fuzzyMatches({
    matchAgainst: ['father.firstname', 'father.name']
  }),
  field('father.surname').fuzzyMatches({
    matchAgainst: ['father.surname', 'father.name']
  })
)

/** The deduplication of the initial version also finds a record of the same child and father. */
export const initialVersionDedupConfig = or(
  dedupConfig,
  and(similarNamedChild, childDobWithin5Days, similarNamedFather)
)

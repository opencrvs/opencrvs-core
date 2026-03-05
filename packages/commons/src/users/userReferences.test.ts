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
  userReferenceFunctions as user,
  resolveJurisdictionReference
} from './userReferences'
import { JurisdictionFilter } from '../scopes-v2'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

describe('userReferenceFunctions', () => {
  describe('user.scope()', () => {
    it('should return a scope option reference', () => {
      const result = user.scope('record.create').attribute('placeOfEvent')

      expect(result).toEqual({
        $scope: 'record.create',
        $option: 'placeOfEvent'
      })
    })
  })

  describe('user.jurisdiction()', () => {
    it("user.jurisdiction('administrativeArea') should return a direct jurisdiction reference", () => {
      const result = user.jurisdiction(
        JurisdictionFilter.enum.administrativeArea
      )

      expect(result).toEqual({
        $jurisdiction: JurisdictionFilter.enum.administrativeArea
      })
    })

    it("user.jurisdiction(user.scope('record.create').attribute('placeOfEvent')) should return a scope option reference", () => {
      const result = user.jurisdiction(
        user.scope('record.create').attribute('placeOfEvent')
      )
      expect(result).toEqual({
        $jurisdiction: { $scope: 'record.create', $option: 'placeOfEvent' }
      })
    })
  })
})

function createTestToken(scopes: string[]) {
  return jwt.sign({ scope: scopes }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:workflow-user'
  })
}

describe('resolveJurisdictionReference()', () => {
  it('should return a jurisdiction filter for a plain jurisdiction reference', () => {
    const jurisdictionReference = user.jurisdiction(
      JurisdictionFilter.enum.administrativeArea
    )

    const result = resolveJurisdictionReference(jurisdictionReference)
    expect(result).toEqual(JurisdictionFilter.enum.administrativeArea)
  })

  it('should return a jurisdiction filter for a scope option reference', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken([
      `type=record.create&event=birth,death&placeOfEvent=${JurisdictionFilter.enum.administrativeArea}`
    ])

    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'birth'
    )

    expect(result).toEqual(JurisdictionFilter.enum.administrativeArea)
  })

  it('should return the default jurisdiction filter for a scope option reference', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken(['type=record.create&event=birth,death'])

    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'birth'
    )

    expect(result).toEqual(JurisdictionFilter.enum.all)
  })

  it('should return undefined if scope is not found', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken([
      'type=record.declare&event=birth,death&placeOfEvent=administrativeArea'
    ])
    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'birth'
    )

    expect(result).toEqual(undefined)
  })

  it('should return undefined if scope has invalid attribute', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken([
      'type=record.create&event=birth,death&placeOfEvent=foobar'
    ])

    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'birth'
    )

    expect(result).toEqual(undefined)
  })

  it('should return most permissive jurisdiction filter if multiple matching scopes are present', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken([
      `type=record.create&event=birth,death&placeOfEvent=${JurisdictionFilter.enum.location}`,
      `type=record.create&placeOfEvent=${JurisdictionFilter.enum.administrativeArea}`
    ])

    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'birth'
    )

    expect(result).toEqual(JurisdictionFilter.enum.administrativeArea)
  })

  it('should return undefined for scope with matching type but wrong event type', () => {
    const scopeAttributeReference = user.jurisdiction(
      user.scope('record.create').attribute('placeOfEvent')
    )

    const token = createTestToken([
      'type=record.create&event=birth&placeOfEvent=administrativeArea'
    ])

    const result = resolveJurisdictionReference(
      scopeAttributeReference,
      token,
      'death'
    )

    expect(result).toEqual(undefined)
  })
})

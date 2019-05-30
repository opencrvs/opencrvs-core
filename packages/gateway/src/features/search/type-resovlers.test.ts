import { searchTypeResolvers } from '@gateway/features/search/type-resovlers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Search type resolvers', () => {
  it('return BirthEventSearchSet type', () => {
    const mock = {
      _type: 'compositions',
      _source: {
        event: 'Birth'
      }
    }
    const res = searchTypeResolvers.EventSearchSet.__resolveType(mock)
    expect(res).toEqual('BirthEventSearchSet')
  })
  it('return DeathEventSearchSet type', () => {
    const mock = {
      _type: 'compositions',
      _source: {
        event: 'Death'
      }
    }
    const res = searchTypeResolvers.EventSearchSet.__resolveType(mock)
    expect(res).toEqual('DeathEventSearchSet')
  })
  describe('type resolvers for birth event', () => {
    it('returns id from birth event search set', () => {
      const id = searchTypeResolvers.BirthEventSearchSet.id({
        _type: 'compositions',
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from birth event search set', () => {
      const type = searchTypeResolvers.BirthEventSearchSet.type({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth'
        }
      })
      expect(type).toBe('Birth')
    })
    it('returns childName from birth event search set', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Anik'],
          family: ['Hoque']
        },
        {
          use: 'bn',
          given: ['অনিক'],
          family: ['হক']
        }
      ])
    })
    it('returns null as childName from birth event search set if invalid data found', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: null,
          family: null
        },
        {
          use: 'bn',
          given: null,
          family: null
        }
      ])
    })
    it('returns date of birth from birth event search set', () => {
      const dob = searchTypeResolvers.BirthEventSearchSet.dateOfBirth({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক',
          childDoB: '01-01-2019'
        }
      })
      expect(dob).toBe('01-01-2019')
    })
    it('returns null as date of birth in case of missing required data', () => {
      const dob = searchTypeResolvers.BirthEventSearchSet.dateOfBirth({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক'
        }
      })
      expect(dob).toBe(null)
    })
    it('returns _source info as registration from birth event search set', () => {
      const registration = searchTypeResolvers.BirthEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            event: 'Birth',
            childFirstNames: 'Anik',
            childFamilyName: 'Hoque',
            childFirstNamesLocal: 'অনিক',
            childFamilyNameLocal: 'হক',
            childDoB: '01-01-2019'
          }
        }
      )
      expect(registration).toEqual({
        event: 'Birth',
        childFirstNames: 'Anik',
        childFamilyName: 'Hoque',
        childFirstNamesLocal: 'অনিক',
        childFamilyNameLocal: 'হক',
        childDoB: '01-01-2019'
      })
    })
  })
  describe('type resolvers for death event', () => {
    it('returns id from death event search set', () => {
      const id = searchTypeResolvers.DeathEventSearchSet.id({
        _type: 'compositions',
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from death event search set', () => {
      const type = searchTypeResolvers.DeathEventSearchSet.type({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death'
        }
      })
      expect(type).toBe('Death')
    })
    it('returns deceassedName from Death event search set', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Anik'],
          family: ['Hoque']
        },
        {
          use: 'bn',
          given: ['অনিক'],
          family: ['হক']
        }
      ])
    })
    it('returns null as deceasedName from Death event search set if invalid data found', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: null,
          family: null
        },
        {
          use: 'bn',
          given: null,
          family: null
        }
      ])
    })
    it('returns date of Death from Death event search set', () => {
      const dod = searchTypeResolvers.DeathEventSearchSet.dateOfDeath({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019'
        }
      })
      expect(dod).toBe('01-01-2019')
    })
    it('returns null as date of death in case of missing required data', () => {
      const dod = searchTypeResolvers.DeathEventSearchSet.dateOfDeath({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক'
        }
      })
      expect(dod).toBe(null)
    })
    it('returns _source info as registration from Death event search set', () => {
      const registration = searchTypeResolvers.DeathEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            event: 'Death',
            deceasedFirstNames: 'Anik',
            deceasedFamilyName: 'Hoque',
            deceasedFirstNamesLocal: 'অনিক',
            deceasedFamilyNameLocal: 'হক',
            deathDate: '01-01-2019'
          }
        }
      )
      expect(registration).toEqual({
        event: 'Death',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019'
      })
    })
  })
  describe('type resolvers for event registration', () => {
    it('returns status from search set', () => {
      const status = searchTypeResolvers.RegistrationSearchSet.status({
        event: 'Death',
        type: 'DECLARED',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019'
      })
      expect(status).toEqual('DECLARED')
    })
    it('returns locationid from search set', () => {
      const locationid = searchTypeResolvers.RegistrationSearchSet.registeredLocationId(
        {
          event: 'Death',
          type: 'DECLARED',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019',
          applicationLocationId: '112345'
        }
      )
      expect(locationid).toEqual('112345')
    })
    it('returns duplicates from search set', () => {
      const duplicates = searchTypeResolvers.RegistrationSearchSet.duplicates({
        event: 'Death',
        type: 'DECLARED',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019',
        applicationLocationId: '112345',
        relatesTo: ['8a737727-a7db-4e77-865f-310dd7afb836']
      })
      expect(duplicates).toEqual(['8a737727-a7db-4e77-865f-310dd7afb836'])
    })
  })
})

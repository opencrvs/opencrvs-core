import { defineMessages } from 'react-intl'

export const countryMessages = defineMessages({
  bd: {
    id: 'countries.bd',
    defaultMessage: 'Bangladesh',
    description: 'ISO Country: bd'
  },
  gb: {
    id: 'countries.gb',
    defaultMessage: 'United Kingdome',
    description: 'ISO Country: gb'
  }
})

export const stateMessages = defineMessages({
  greaterLondon: {
    id: 'states.greaterLondon',
    defaultMessage: 'Greater London',
    description: 'Test state'
  },
  wales: {
    id: 'states.wales',
    defaultMessage: 'Wales',
    description: 'Test state'
  }
})

export const districtMessages = defineMessages({
  wandsworth: {
    id: 'districts.wandsworth',
    defaultMessage: 'Wandsworth',
    description: 'Test state'
  },
  lambeth: {
    id: 'districts.lambeth',
    defaultMessage: 'lambeth',
    description: 'Test state'
  }
})

export const countries = [
  { value: 'BD', label: countryMessages.bd },
  { value: 'GB', label: countryMessages.gb }
]

export const states = [
  { value: 'Greater London', label: stateMessages.greaterLondon },
  { value: 'Wales', label: stateMessages.wales }
]

export const districts = [
  { value: 'Wandsworth', label: districtMessages.wandsworth },
  { value: 'Lambeth', label: districtMessages.lambeth }
]

import { push } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  BIRTH_PARENT_FORM
} from '@opencrvs/register/src/navigation/routes'

export function goToBirthRegistration() {
  return push(SELECT_INFORMANT)
}

export function goToBirthRegistrationAsParent() {
  return push(BIRTH_PARENT_FORM)
}

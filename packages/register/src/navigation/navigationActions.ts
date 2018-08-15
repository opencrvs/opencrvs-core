import { push } from 'react-router-redux'
import { SELECT_INFORMANT } from '@opencrvs/register/src/navigation/routes'

export function goToBirthRegistration() {
  return push(SELECT_INFORMANT)
}

import { IRegisterFormState } from './reducer'
import { IStoreState } from '../../store'
import { IFormSection } from 'src/forms'

const getPartialState = (store: IStoreState): IRegisterFormState =>
  store.registerForm

function getKey<K extends keyof IRegisterFormState>(
  store: IStoreState,
  key: K
) {
  return getPartialState(store)[key]
}

export const getRegisterForm = (
  store: IStoreState
): IRegisterFormState['registerForm'] => getKey(store, 'registerForm')

export const getRegisterFormSection = (
  store: IStoreState,
  key: string
): IFormSection => {
  const registerForm = getRegisterForm(store)
  return registerForm.sections.find(
    (section: IFormSection) => section.id === key
  ) as IFormSection
}

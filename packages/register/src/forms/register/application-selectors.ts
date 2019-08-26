import { IRegisterFormState } from '@register/forms/register/reducer'
import { IStoreState } from '@opencrvs/register/src/store'
import { IFormSection, Event } from '@register/forms'

const getPartialState = (state: IStoreState): IRegisterFormState =>
  state.registerForm

function getKey<K extends keyof IRegisterFormState>(
  state: IStoreState,
  key: K
) {
  return getPartialState(state)[key]
}

// Register form needs to be ready before this function is called
export const getRegisterForm = (state: IStoreState) => {
  const form = getKey(state, 'registerForm')
  if (!form) {
    throw new Error(
      'Selector called before data was ready. This should never happen'
    )
  }

  return form
}

export const getEventRegisterForm = (state: IStoreState, event: Event) => {
  return getRegisterForm(state)[event]
}

export const getRegisterFormSection = (
  state: IStoreState,
  key: string,
  event: Event
): IFormSection => {
  const eventRegisterForm = getEventRegisterForm(state, event)

  const section = eventRegisterForm.sections.find(
    (section: IFormSection) => section.id === key
  )!

  if (!section) {
    throw new Error(
      'Selector called with an unknown section. This should never happen'
    )
  }

  return section
}

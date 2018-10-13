import { IRegisterFormState } from './reducer'
import { IDocumentUploadState } from './document-upload-reducer'
import { IStoreState } from '../../store'
import { IFormSection } from 'src/forms'

const getPartialState = (
  store: IStoreState,
  key: string
): IRegisterFormState | IDocumentUploadState => store[key]

function getKey<
  R extends keyof IRegisterFormState,
  D extends keyof IDocumentUploadState
>(store: IStoreState, key: R | D) {
  return getPartialState(store, key.toString())[key.toString()]
}

export const getRegisterForm = (
  store: IStoreState
): IRegisterFormState['registerForm'] => getKey(store, 'registerForm')

export const getDocumentUploadForm = (
  store: IStoreState
): IDocumentUploadState['documentUploadForm'] =>
  getKey(store, 'documentUploadForm')

export const getRegisterFormSection = (
  store: IStoreState,
  key: string
): IFormSection => {
  const registerForm = getRegisterForm(store)
  return registerForm.sections.find(
    (section: IFormSection) => section.id === key
  ) as IFormSection
}

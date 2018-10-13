import { LoopReducer, Loop } from 'redux-loop'
import { IFormSection } from 'src/forms'
import { documentsUploadSection } from './documents-upload-section'

export type IDocumentUploadState = {
  documentUploadForm: IFormSection
}

export const initialState: IDocumentUploadState = {
  documentUploadForm: documentsUploadSection
}

const GET_REGISTER_DOCUMENT_UPLOAD_FORM =
  'REGISTER_FORM/GET_REGISTER_DOCUMENT_UPLOAD_FORM'
type GetRegisterDocumentUploadFormAction = {
  type: typeof GET_REGISTER_DOCUMENT_UPLOAD_FORM
}
type Action = GetRegisterDocumentUploadFormAction

export const documentUploadFormReducer: LoopReducer<
  IDocumentUploadState,
  Action
> = (
  state: IDocumentUploadState = initialState,
  action: Action
): IDocumentUploadState | Loop<IDocumentUploadState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}

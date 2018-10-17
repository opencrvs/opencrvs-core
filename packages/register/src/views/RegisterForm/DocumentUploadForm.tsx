import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { ImageUploader } from '@opencrvs/components/lib/forms'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import {
  IFormSection,
  IFormField,
  IFormSectionData,
  IImageValue
} from '../../forms'
import { Form } from '../../components/form'
import { IStoreState } from '../../store'
import { IDraft, modifyDraft } from '../../drafts'
import { getDocumentUploadForm } from '../../forms/register/selectors'
import { getValidationErrorsForForm } from 'src/forms/validation'
import { goBack as goBackAction } from 'src/navigation'

const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
  z-index: 1;
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormImageUploader = styled(ImageUploader)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`
export const imageListKey = 'upoloaded_images'

export const messages = defineMessages({
  upload: {
    id: 'register.form.upload',
    defaultMessage: 'Upload',
    description: 'Upload button'
  }
})

type DispatchProps = {
  modifyDraft: typeof modifyDraft
  goBack: typeof goBackAction
}

type Props = {
  draft: IDraft
  tabId: string
  documentUploadForm: IFormSection
}

type FullProps = Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  data: IFormSectionData
  showUploadButton: boolean
}
class DocumentUploadFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      data: {},
      showUploadButton: this.shouldShowUploadButton({})
    }
  }

  storeData = (documentData: IFormSectionData) => {
    this.setState({ data: documentData })
    if (this.shouldShowUploadButton(documentData)) {
      this.setState({ showUploadButton: true })
    }
  }

  handleFileChange = (uploadedImage: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        const { draft, tabId } = this.props
        this.props.modifyDraft({
          ...draft,
          data: {
            ...draft.data,
            [tabId]: {
              ...draft.data[tabId],
              [imageListKey]: getImageList(this.props, {
                file: uploadedImage.name,
                name: Object.values(this.state.data).join(' '),
                size: uploadedImage.size,
                base64Value: reader.result.toString()
              })
            }
          }
        })
        this.props.goBack()
      }
    }
    reader.readAsDataURL(uploadedImage)
  }

  shouldShowUploadButton = (documentData: IFormSectionData) => {
    return (
      documentData &&
      !hasFormError(this.props.documentUploadForm.fields, documentData)
    )
  }

  render() {
    const { intl, documentUploadForm, goBack } = this.props
    const { showUploadButton } = this.state
    return (
      <ActionPage title={intl.formatMessage(messages.upload)} goBack={goBack}>
        <FormContainer>
          <Box>
            <Form
              id={documentUploadForm.id}
              onChange={this.storeData}
              setAllFieldsDirty={false}
              fields={documentUploadForm.fields}
            />
            {showUploadButton && (
              <FormAction>
                <FormImageUploader
                  id="upload_document"
                  title={intl.formatMessage(messages.upload)}
                  icon={() => <ArrowForward />}
                  handleFileChange={this.handleFileChange}
                />
              </FormAction>
            )}
          </Box>
        </FormContainer>
      </ActionPage>
    )
  }
}

function hasFormError(fields: IFormField[], values: IFormSectionData) {
  const errors = getValidationErrorsForForm(fields, values)

  const fieldListWithErrors = Object.keys(errors).filter(key => {
    return errors[key] && errors[key].length > 0
  })
  return fieldListWithErrors && fieldListWithErrors.length > 0
}
function getImageList(props: Props, image: IImageValue): IImageValue[] {
  const { draft, tabId } = props
  const images =
    draft.data[tabId] && draft.data[tabId][imageListKey]
      ? (draft.data[tabId][imageListKey] as IImageValue[])
      : []
  images.push(image)
  return images
}
function mapStateToProps(
  state: IStoreState,
  props: Props & RouteComponentProps<{ draftId: string; tabId?: string }>
) {
  const { match } = props
  const documentUploadForm = getDocumentUploadForm(state)

  const draft = state.drafts.drafts.find(
    ({ id }) => id === parseInt(match.params.draftId, 10)
  )

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }

  const tabId = match.params.tabId ? match.params.tabId : documentUploadForm.id

  return {
    documentUploadForm,
    tabId,
    draft,
    language: state.i18n.language
  }
}

export const DocumentUploadForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    goBack: goBackAction,
    modifyDraft
  }
)(injectIntl<FullProps>(DocumentUploadFormView))

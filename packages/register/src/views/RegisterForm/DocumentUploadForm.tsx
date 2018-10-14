import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { Box } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { IFormSection, IFormField, IFormSectionData } from '../../forms'
import { Form } from '../../components/form'
import { IStoreState } from '../../store'
import { IDraft, modifyDraft } from '../../drafts'
import { getDocumentUploadForm } from '../../forms/register/selectors'
import { getValidationErrorsForForm } from 'src/forms/validation'

const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
  z-index: 1;
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const messages = defineMessages({
  upload: {
    id: 'register.form.upload',
    defaultMessage: 'Upload',
    description: 'Upload button'
  }
})

function hasFormError(fields: IFormField[], values: IFormSectionData) {
  const errors = getValidationErrorsForForm(fields, values)

  const fieldListWithErrors = Object.keys(errors).filter(key => {
    return errors[key] && errors[key].length > 0
  })
  return fieldListWithErrors && fieldListWithErrors.length > 0
}

type DispatchProps = {
  modifyDraft: typeof modifyDraft
}

type Props = {
  draft: IDraft
  documentUploadForm: IFormSection
  fields: IFormField[]
}

type FullProps = Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  showUploadButton: boolean
}
class DocumentUploadFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showUploadButton: this.shouldShowUploadButton()
    }
  }

  modifyDraft = (documentData: IFormSectionData) => {
    const { documentUploadForm, draft } = this.props
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [documentUploadForm.id]: documentData
      }
    })
    if (this.shouldShowUploadButton(documentData)) {
      this.setState({ showUploadButton: true })
    }
  }

  shouldShowUploadButton = (
    documentData = this.props.draft.data[this.props.documentUploadForm.id]
  ) => {
    return (
      documentData &&
      !hasFormError(this.props.documentUploadForm.fields, documentData)
    )
  }

  render() {
    const { intl, documentUploadForm, fields } = this.props
    const { showUploadButton } = this.state
    return (
      <FormContainer>
        <Box>
          <Form
            id={documentUploadForm.id}
            onChange={this.modifyDraft}
            setAllFieldsDirty={false}
            fields={fields}
          />
          {showUploadButton && (
            <FormAction>
              <FormPrimaryButton
                id="upload_document"
                icon={() => <ArrowForward />}
              >
                {intl.formatMessage(messages.upload)}
              </FormPrimaryButton>
            </FormAction>
          )}
        </Box>
      </FormContainer>
    )
  }
}

function replaceInitialValues(fields: IFormField[], sectionValues: object) {
  return fields.map(field => ({
    ...field,
    initialValue: sectionValues[field.name] || field.initialValue
  }))
}

function mapStateToProps(
  state: IStoreState,
  props: Props & RouteComponentProps<{ draftId: string }>
) {
  const { match } = props
  const documentUploadForm = getDocumentUploadForm(state)

  const draft = state.drafts.drafts.find(
    ({ id }) => id === parseInt(match.params.draftId, 10)
  )

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }

  const fields = replaceInitialValues(
    documentUploadForm.fields,
    draft.data[documentUploadForm.id] || {}
  )

  return {
    documentUploadForm,
    fields,
    draft
  }
}

export const DocumentUploadForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    modifyDraft
  }
)(injectIntl<FullProps>(DocumentUploadFormView))

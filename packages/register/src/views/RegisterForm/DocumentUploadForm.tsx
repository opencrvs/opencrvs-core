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

const FormViewContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`
type DispatchProps = {
  modifyDraft: typeof modifyDraft
}

type Props = {
  draft: IDraft
  documentUploadForm: IFormSection
  setAllFieldsDirty: boolean
}

type FullProps = Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

class DocumentUploadFormView extends React.Component<FullProps> {
  constructor(props: FullProps) {
    super(props)
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
  }

  render() {
    const { intl, documentUploadForm, setAllFieldsDirty } = this.props

    return (
      <FormViewContainer>
        <Box>
          <Form
            id={documentUploadForm.id}
            onChange={this.modifyDraft}
            setAllFieldsDirty={setAllFieldsDirty}
            title={intl.formatMessage(documentUploadForm.title)}
            fields={documentUploadForm.fields}
          />
          <FormAction>
            <FormPrimaryButton id="upload_doc" icon={() => <ArrowForward />}>
              {intl.formatMessage(messages.upload)}
            </FormPrimaryButton>
          </FormAction>
        </Box>
      </FormViewContainer>
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

  replaceInitialValues(
    documentUploadForm.fields,
    draft.data[documentUploadForm.id] || {}
  )

  return {
    documentUploadForm,
    setAllFieldsDirty: true,
    draft
  }
}

export const DocumentUploadForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    modifyDraft
  }
)(injectIntl<FullProps>(DocumentUploadFormView))

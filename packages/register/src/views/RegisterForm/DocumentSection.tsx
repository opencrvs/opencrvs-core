import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from 'src/styled-components'
import { Box } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Paragraph } from '@opencrvs/components/lib/typography'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { IDraft } from 'src/drafts'
import { goToTab, goToBirthRegistrationDocumentUpload } from 'src/navigation'
import { UploadPhotoAction } from 'src/components/UploadPhotoAction'
import { FormList } from 'src/components/form'
import { IStoreState } from 'src/store'

export const messages = defineMessages({
  documentsTitle: {
    id: 'register.form.section.documentsTitle',
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents'
  },
  uploadImage: {
    id: 'register.form.section.documents.uploadImage',
    defaultMessage: 'Upload a photo of the supporting document',
    description: 'Title for the upload image button'
  },
  paragraph: {
    id: 'register.form.section.documents.paragraph',
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed bellow is required:',
    description: 'Documents Paragraph text'
  },
  informantAttestation: {
    id: 'register.form.section.documents.list.informantAttestation',
    defaultMessage: 'Attestation of the informant, or',
    description: 'Attested document of the informant'
  },
  attestedVaccination: {
    id: 'register.form.section.documents.list.attestedVaccination',
    defaultMessage: 'Attested copy of the vaccination (EPI) card, or',
    description: 'Attested copy of the vaccination card'
  },
  attestedBirthRecord: {
    id: 'register.form.section.documents.list.attestedBirthRecord',
    defaultMessage: 'Attested copy of hospital document or birth record, or',
    description: 'Attested copy of hospital document'
  },
  certification: {
    id: 'register.form.section.documents.list.certification',
    defaultMessage:
      'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
    description: 'Certification regarding NGO worker'
  },
  otherDocuments: {
    id: 'register.form.section.documents.list.otherDocuments',
    defaultMessage:
      'Attested copy(s) of the document as prescribed by the Registrar',
    description: 'Attested copy(s) of the document'
  },
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  }
})

const DocumentBox = styled(Box)`
  margin-bottom: 30px;
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
`
const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`
const ActionBlock = styled.div`
  display: flex;
  justify-content: center;
`
const LabelBlock = styled.div`
  margin: 30px 0px 70px 0px;
  padding-top: 20px;
  border-top: 2px solid ${({ theme }) => theme.colors.background};
`

type DispatchProps = {
  goToTab: typeof goToTab
  goToUpload: typeof goToBirthRegistrationDocumentUpload
}
type OwnProps = {
  draft: IDraft
}

class DocumentSectionForm extends React.Component<
  OwnProps & DispatchProps & InjectedIntlProps
> {
  render() {
    const { intl, draft } = this.props
    return (
      <DocumentBox>
        <FormSectionTitle id="form_section_title_documents">
          {intl.formatMessage(messages.documentsTitle)}
        </FormSectionTitle>
        <UploadPhotoAction
          id="upload_image_action"
          title={intl.formatMessage(messages.uploadImage)}
          onClick={() => this.props.goToUpload(draft.id, 'documents')}
        />
        <LabelBlock>
          <Paragraph>{intl.formatMessage(messages.paragraph)}</Paragraph>
          <FormList
            list={[
              messages.informantAttestation,
              messages.attestedVaccination,
              messages.attestedBirthRecord,
              messages.certification,
              messages.otherDocuments
            ]}
          />
        </LabelBlock>
        <ActionBlock>
          <FormPrimaryButton id="next_section" icon={() => <ArrowForward />}>
            {intl.formatMessage(messages.next)}
          </FormPrimaryButton>
        </ActionBlock>
      </DocumentBox>
    )
  }
}

export const DocumentSection = connect<{}, DispatchProps, OwnProps>(
  (state: IStoreState, { draft }: OwnProps) => ({
    draft,
    language: state.i18n.language
  }),
  {
    goToTab,
    goToUpload: goToBirthRegistrationDocumentUpload
  }
)(injectIntl(DocumentSectionForm))

import {
  ViewType,
  PDF_DOCUMENT_VIEWER,
  IFormSection,
  CertificateSection
} from '@register/forms'
import { messages } from '@register/i18n/messages/views/certificate'

export const certificatePreview: IFormSection = {
  id: CertificateSection.CertificatePreview,
  viewType: 'form' as ViewType,
  name: messages.preview,
  title: messages.preview,
  groups: [
    {
      id: 'certificate-preview-view-group',
      fields: [
        {
          name: 'certificate',
          type: PDF_DOCUMENT_VIEWER,
          label: messages.noLabel,
          initialValue: '',
          validate: []
        }
      ]
    }
  ]
}

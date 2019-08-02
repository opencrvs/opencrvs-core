import { IFormSection, ViewType, PDF_DOCUMENT_VIEWER } from '@register/forms'
import { messages } from '@register/i18n/messages/views/certificate'

export const certificatePreview: IFormSection = {
  id: 'certificatePreview',
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

import { IFormSection, ViewType, SELECT_WITH_OPTIONS, LINK } from 'src/forms'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  preview: {
    id: 'register.workQueue.print.certificatePreview',
    defaultMessage: 'Certificate Preview',
    description: 'The title for certificate preview form'
  },
  selectSignature: {
    id: 'register.workQueue.print.selectSignature',
    defaultMessage: 'Select signature',
    description: 'The label for choose signature select'
  },
  signature: {
    id: 'register.workQueue.print.signature1',
    defaultMessage: 'UP Secretary'
  },
  addAnotherSignature: {
    id: 'register.workQueue.print.addAnotherSignature',
    defaultMessage: 'Add another'
  }
})

export const certificatePreview: IFormSection = {
  id: 'certificatePreview',
  viewType: 'form' as ViewType,
  name: messages.preview,
  title: messages.preview,
  fields: [
    {
      name: `signature1`,
      type: SELECT_WITH_OPTIONS,
      label: messages.selectSignature,
      initialValue: '',
      validate: [],
      options: [{ value: 'FIRST ONE', label: messages.signature }]
    },
    {
      name: `signature2`,
      type: SELECT_WITH_OPTIONS,
      label: messages.selectSignature,
      initialValue: '',
      validate: [],
      options: [{ value: 'SECOND ONE', label: messages.signature }]
    },
    {
      name: 'addSignature',
      type: LINK,
      label: messages.addAnotherSignature,
      initialValue: '',
      validate: []
    }
  ]
}

import {
  ViewType,
  SELECT_WITH_OPTIONS,
  PARAGRAPH,
  IFormSection
} from '@register/forms'
import { messages } from '@register/i18n/messages/views/certificate'

export const paymentFormSection: IFormSection = {
  id: 'payment',
  viewType: 'form' as ViewType,
  name: messages.payment,
  title: messages.payment,
  groups: [
    {
      id: 'payment-view-group',
      fields: [
        {
          name: 'paymentMethod',
          type: SELECT_WITH_OPTIONS,
          label: messages.paymentMethod,
          initialValue: 'MANUAL',
          required: true,
          validate: [],
          options: [{ value: 'MANUAL', label: messages.manualPaymentMethod }]
        },
        {
          name: 'collectPayment',
          type: PARAGRAPH,
          label: messages.collectPayment,
          initialValue: '',
          validate: []
        },
        {
          name: 'service',
          type: PARAGRAPH,
          label: messages.service,
          initialValue: '',
          validate: []
        },
        {
          name: 'paymentAmount',
          type: PARAGRAPH,
          label: messages.paymentAmount,
          initialValue: '',
          fontSize: 'h1FontStyle',
          required: false,
          validate: []
        }
      ]
    }
  ]
}

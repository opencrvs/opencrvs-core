import {
  IFormSection,
  ViewType,
  SELECT_WITH_OPTIONS,
  PARAGRAPH,
  SUBSECTION
} from 'src/forms'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  payment: {
    id: 'register.workQueue.print.payment',
    defaultMessage: 'Payment',
    description: 'The title for payment section'
  },
  paymentMethod: {
    id: 'register.workQueue.print.paymentMethod',
    defaultMessage: 'Payment method',
    description: 'The label for payment method select'
  },
  manualPaymentMethod: {
    id: 'register.workQueue.print.manualPaymentMethod',
    defaultMessage: 'Manual',
    description: 'The label for select option for manual payment method'
  },
  collectPayment: {
    id: 'register.workQueue.print.collectPayment',
    defaultMessage:
      'Please collect the payment, print the receipt and hand it over to the payee.',
    description: 'The label for collect payment paragraph'
  },
  paymentAmount: {
    id: 'register.workQueue.print.paymentAmount',
    defaultMessage: `\u09F3 5.00`,
    description: 'The label for payment amount subsection'
  }
})
export const paymentSection: IFormSection = {
  id: 'payment',
  viewType: 'form' as ViewType,
  name: messages.payment,
  title: messages.payment,
  fields: [
    {
      name: 'paymentMethod',
      type: SELECT_WITH_OPTIONS,
      label: messages.paymentMethod,
      initialValue: 'MANUAL',
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
      name: 'paymentAmount',
      type: SUBSECTION,
      label: messages.paymentAmount,
      initialValue: '',
      required: false,
      validate: []
    }
  ]
}

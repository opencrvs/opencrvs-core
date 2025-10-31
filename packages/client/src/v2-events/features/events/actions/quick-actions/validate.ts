import { QuickActionConfig } from './useQuickActionModal'

function onConfirm() {
  console.log('validate')
}

export const validate: QuickActionConfig = {
  description: {
    id: 'review.validate.description.complete',
    defaultMessage:
      'The informant will receive an email with a registration number that they can use to collect the certificate.'
  },
  onConfirm
}

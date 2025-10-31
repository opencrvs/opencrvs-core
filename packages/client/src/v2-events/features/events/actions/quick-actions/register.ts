import { QuickActionConfig } from './useQuickActionModal'

export const register: QuickActionConfig = {
  description: {
    id: 'review.register.description.complete',
    defaultMessage:
      "By clicking 'Confirm', you confirm that the information entered is correct and the event can be registered."
  },
  onConfirm: () => {
    console.log('register')
  }
}

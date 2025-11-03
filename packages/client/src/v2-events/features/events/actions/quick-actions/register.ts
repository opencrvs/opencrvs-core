import { v4 as uuid } from 'uuid'
import { QuickActionConfig } from './useQuickActionModal'

export const register: QuickActionConfig = {
  description: {
    id: 'review.register.description.complete',
    defaultMessage:
      "By clicking 'Confirm', you confirm that the information entered is correct and the event can be registered."
  },
  onConfirm: ({ event, actions }) => {
    return actions.register.mutate({
      eventId: event.id,
      declaration: event.declaration,
      // @TODO Annotation is currently not used for this action. As part of custom actions work, we will add support for configuring annotation fields to the validate & register modals.
      annotation: {},
      transactionId: uuid()
    })
  }
}

import { v4 as uuid } from 'uuid'
import { ActionType } from '@opencrvs/commons/client'
import { QuickActionConfig } from './useQuickActionModal'

export const validate: QuickActionConfig = {
  description: {
    id: 'review.validate.description.complete',
    defaultMessage:
      'The informant will receive an email with a registration number that they can use to collect the certificate.'
  },
  onConfirm: ({ event, actions, customActions, isActionAllowed }) => {
    if (isActionAllowed(ActionType.REGISTER)) {
      return customActions.registerOnValidate.mutate({
        eventId: event.id,
        declaration: event.declaration,
        transactionId: uuid(),
        annotation: {}
      })
    }

    return actions.validate.mutate({
      eventId: event.id,
      declaration: event.declaration,
      // @TODO Annotation is currently not used for this action. As part of custom actions work, we will add support for configuring annotation fields to the validate & register modals.
      annotation: {},
      transactionId: uuid()
    })
  }
}

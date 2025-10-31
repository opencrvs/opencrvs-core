import { v4 as uuid } from 'uuid'
import { QuickActionConfig } from './useQuickActionModal'

export const archive: QuickActionConfig = {
  description: {
    id: 'recordAudit.archive.confirmation.body',
    defaultMessage:
      'This will remove the declaration from the workqueue and change the status to Archive. To revert this change you will need to search for the declaration.',
    description: 'Confirmation body for archiving a declaration'
  },
  confirmButtonType: 'danger',
  confirmButtonLabel: {
    id: 'buttons.archive',
    defaultMessage: 'Archive',
    description: 'Archive button text'
  },
  onConfirm: ({ event, actions }) => {
    return actions.archive.mutate({
      eventId: event.id,
      transactionId: uuid(),
      content: {
        reason: 'Archived from action menu'
      }
    })
  }
}

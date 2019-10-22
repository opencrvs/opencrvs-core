import { defineMessages, MessageDescriptor } from 'react-intl'

interface IButtonsMessages {
  back: MessageDescriptor
  apply: MessageDescriptor
  cancel: MessageDescriptor
  change: MessageDescriptor
  confirm: MessageDescriptor
  continueButton: MessageDescriptor
  createUser: MessageDescriptor
  delete: MessageDescriptor
  edit: MessageDescriptor
  editRegistration: MessageDescriptor
  exitButton: MessageDescriptor
  finish: MessageDescriptor
  goToHomepage: MessageDescriptor
  login: MessageDescriptor
  logout: MessageDescriptor
  next: MessageDescriptor
  no: MessageDescriptor
  preview: MessageDescriptor
  print: MessageDescriptor
  register: MessageDescriptor
  reject: MessageDescriptor
  rejectApplication: MessageDescriptor
  retry: MessageDescriptor
  review: MessageDescriptor
  saveExitButton: MessageDescriptor
  search: MessageDescriptor
  select: MessageDescriptor
  send: MessageDescriptor
  sendForReview: MessageDescriptor
  sendIncomplete: MessageDescriptor
  sendForApproval: MessageDescriptor
  settings: MessageDescriptor
  start: MessageDescriptor
  update: MessageDescriptor
  upload: MessageDescriptor
  yes: MessageDescriptor
  approve: MessageDescriptor
  editRecord: MessageDescriptor
}

const messagesToDefine: IButtonsMessages = {
  approve: {
    id: 'buttons.approve',
    defaultMessage: 'Approve',
    description: 'Approve button text'
  },
  apply: {
    defaultMessage: 'Apply',
    description: 'Apply button label',
    id: 'buttons.apply'
  },
  back: {
    defaultMessage: 'Back',
    description: 'Back button',
    id: 'buttons.back'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'buttons.cancel'
  },
  change: {
    defaultMessage: 'Change',
    description: 'Change action',
    id: 'buttons.change'
  },
  confirm: {
    defaultMessage: 'Confirm',
    description: 'Confirm button text',
    id: 'buttons.confirm'
  },
  continueButton: {
    defaultMessage: 'Continue',
    description: 'Continue Button Text',
    id: 'buttons.continue'
  },
  createUser: {
    defaultMessage: 'Create user',
    description: 'Label for submit button of user creation form',
    id: 'user.form.buttons.submit'
  },
  delete: {
    defaultMessage: 'Delete',
    description: 'Delete button',
    id: 'buttons.delete'
  },
  edit: {
    defaultMessage: 'Edit',
    description: 'Edit button text',
    id: 'buttons.edit'
  },
  editRegistration: {
    defaultMessage: 'Edit Registration',
    description: 'Edit registration button text',
    id: 'buttons.editRegistration'
  },
  exitButton: {
    defaultMessage: 'EXIT',
    description: 'Label for Exit button on EventTopBar',
    id: 'buttons.exit'
  },
  finish: {
    defaultMessage: 'Finish',
    description: 'The label for finish printing certificate button',
    id: 'buttons.finish'
  },
  goToHomepage: {
    defaultMessage: 'Go to Homepage',
    description: 'Label for Go to Homepage button',
    id: 'buttons.goToHomePage'
  },
  login: {
    defaultMessage: 'Login',
    description: 'Login button on session expire modal',
    id: 'buttons.login'
  },
  logout: {
    defaultMessage: 'Logout',
    description: 'logout title',
    id: 'buttons.logout'
  },
  next: {
    defaultMessage: 'Next',
    description: 'The label for next button',
    id: 'buttons.next'
  },
  no: {
    defaultMessage: 'No',
    description: 'No button text',
    id: 'buttons.no'
  },
  preview: {
    defaultMessage: 'Preview',
    description: 'Preview button',
    id: 'buttons.preview'
  },
  print: {
    defaultMessage: 'Print',
    description: 'Print button text',
    id: 'buttons.print'
  },
  register: {
    defaultMessage: 'Register',
    description: 'Label for button on register confirmation modal',
    id: 'buttons.register'
  },
  reject: {
    defaultMessage: 'Reject',
    description: 'A label for reject link',
    id: 'buttons.reject'
  },
  rejectApplication: {
    defaultMessage: 'Reject Application',
    description: 'Reject application button text',
    id: 'buttons.rejectApplication'
  },
  retry: {
    defaultMessage: 'Retry',
    description: 'The title of retry button for failed application',
    id: 'buttons.retry'
  },
  review: {
    defaultMessage: 'Review',
    description: 'Review button text',
    id: 'buttons.review'
  },
  saveExitButton: {
    defaultMessage: 'SAVE & EXIT',
    description: 'SAVE & EXIT Button Text',
    id: 'buttons.saveAndExit'
  },
  search: {
    defaultMessage: 'Search',
    description: 'The title of search input submit button',
    id: 'buttons.search'
  },
  select: {
    defaultMessage: 'SELECT',
    description: 'The select title',
    id: 'buttons.select'
  },
  send: {
    defaultMessage: 'Send',
    description: 'Submit button on submit modal',
    id: 'buttons.send'
  },
  sendForReview: {
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text',
    id: 'buttons.sendForReview'
  },
  sendIncomplete: {
    defaultMessage: 'Send incomplete',
    description: 'Title for Incomplete submit button',
    id: 'buttons.sendIncomplete'
  },
  sendForApproval: {
    defaultMessage: 'SEND FOR APPROVAL',
    description: 'Title for complete submit button',
    id: 'buttons.sendForApproval'
  },
  settings: {
    defaultMessage: 'Settings',
    description: 'Menu item settings',
    id: 'buttons.settings'
  },
  start: {
    defaultMessage: 'Start',
    description: 'Label of start button',
    id: 'buttons.start'
  },
  update: {
    defaultMessage: 'Update',
    description: 'The title of update button for draft application',
    id: 'buttons.update'
  },
  upload: {
    defaultMessage: 'Upload',
    description: 'Upload buttton',
    id: 'buttons.upload'
  },
  yes: {
    defaultMessage: 'Yes',
    description: 'Yes button text',
    id: 'buttons.yes'
  },
  editRecord: {
    id: 'buttons.editRecord',
    defaultMessage: 'Edit record',
    description: 'Edit record button text on review certificate'
  }
}

export const buttonMessages: IButtonsMessages = defineMessages(messagesToDefine)

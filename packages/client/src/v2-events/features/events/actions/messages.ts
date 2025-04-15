/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

/**
 * Translations for declaration action review pages.
 */

const confirmModalMessages = {
  complete: {
    declare: {
      title: {
        id: 'v2.review.declare.confirmModal.title',
        defaultMessage: 'Send for review?',
        description: 'The title for review action modal when declaring'
      },
      description: {
        id: 'v2.review.declare.confirmModal.description',
        defaultMessage: 'This declaration will be sent for review',
        description: 'The description for review action modal when declaring'
      },
      onConfirm: {
        id: 'v2.review.declare.confirmModal.confirm',
        defaultMessage: 'Confirm',
        description: 'The label for modal confirm button when declaring'
      },
      onCancel: {
        id: 'v2.review.declare.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when declaring'
      }
    },
    validate: {
      title: {
        id: 'v2.review.validate.confirmModal.title',
        defaultMessage: 'Send for approval?',
        description: 'The title for review action modal when validating'
      },
      description: {
        id: 'v2.review.validate.confirmModal.description',
        defaultMessage:
          'This declaration will be sent for approval prior to registration.',
        description: 'The description for review action modal when validating'
      },
      onConfirm: {
        id: 'v2.review.validate.confirmModal.confirm',
        defaultMessage: 'Confirm',
        description: 'The label for modal confirm button when validating'
      },
      onCancel: {
        id: 'v2.review.validate.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when validating'
      }
    },
    register: {
      title: {
        id: 'v2.review.register.confirmModal.title',
        defaultMessage: 'Register the {event}?',
        description: 'The title for review action modal when registering'
      },
      description: {
        id: 'v2.review.register.confirmModal.description',
        defaultMessage: '‎', // intentionally empty, as the description is not used in v1
        description: 'The description for review action modal when registering'
      },
      onConfirm: {
        id: 'v2.review.register.confirmModal.confirm',
        defaultMessage: 'Register',
        description: 'The label for modal confirm button when registering'
      },
      onCancel: {
        id: 'v2.review.register.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when registering'
      }
    }
  },
  incomplete: {
    declare: {
      title: {
        id: 'v2.review.declare.incomplete.confirmModal.title',
        defaultMessage: 'Send for review?',
        description: 'The title for review action modal when declaring'
      },
      description: {
        id: 'v2.review.declare.incomplete.confirmModal.description',
        defaultMessage: 'This incomplete declaration will be sent for review.',
        description:
          'The description for review action modal when declaring incomplete'
      },
      onConfirm: {
        id: 'v2.review.declare.incomplete.confirmModal.confirm',
        defaultMessage: 'Confirm',
        description: 'The label for modal confirm button when declaring'
      },
      onCancel: {
        id: 'v2.review.declare.incomplete.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when declaring'
      }
    }
  }
}
const registerMessages = {
  title: {
    id: 'v2.review.register.title',
    defaultMessage: 'Register event',
    description: 'The title shown when reviewing a record to register'
  },
  onConfirm: {
    id: 'v2.review.register.confirm',
    defaultMessage: 'Register',
    description: 'The label for register button of review action'
  },
  onReject: {
    id: 'v2.review.register.reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of review action'
  }
}

const validateMessages = {
  title: {
    id: 'v2.review.validate.title',
    defaultMessage: 'Send for approval',
    description: 'The title shown when reviewing a record to validate'
  },
  onConfirm: {
    id: 'v2.review.validate.confirm',
    defaultMessage: 'Send for approval',
    description: 'The label for review action button when validating'
  },
  onReject: {
    id: 'v2.review.validate.reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of review action'
  }
}

const declareMessages = {
  onConfirm: {
    id: 'v2.review.declare.confirm',
    defaultMessage: 'Send for review',
    description: 'The label for review action button when declaring'
  }
}

export const reviewMessages = {
  complete: {
    register: {
      title: registerMessages.title,
      description: {
        id: 'v2.review.register.description.complete',
        defaultMessage:
          'By clicking register, you confirm that the information entered is correct and the event can be registered.',
        description:
          'The description for registration action when form is complete'
      },
      onConfirm: registerMessages.onConfirm,
      onReject: registerMessages.onReject,
      modal: confirmModalMessages.complete.register
    },
    validate: {
      title: validateMessages.title,
      description: {
        id: 'v2.review.validate.description.complete',
        defaultMessage:
          'The informant will receive an email with a registration number that they can use to collect the certificate',
        description: 'The description for validate action when form is complete'
      },
      onConfirm: validateMessages.onConfirm,
      onReject: validateMessages.onReject,
      modal: confirmModalMessages.complete.validate
    },
    declare: {
      title: {
        id: 'v2.review.declare.title.complete',
        defaultMessage: 'Declaration complete',
        description:
          'The title shown when reviewing an incomplete record to declare'
      },
      description: {
        id: 'v2.review.declare.description.complete',
        defaultMessage:
          'The informant will receive an email with a registration number that they can use to collect the certificate',
        description: 'The description for declare action when form is complete'
      },
      onConfirm: declareMessages.onConfirm,
      modal: confirmModalMessages.complete.declare
    }
  },
  incomplete: {
    register: {
      title: registerMessages.title,
      description: {
        id: 'v2.reviewAction.register.description.incomplete',
        defaultMessage: 'Please add mandatory information before registering',
        description:
          'The description for registration action when form is incomplete'
      },
      onConfirm: registerMessages.onConfirm,
      onReject: registerMessages.onReject,
      modal: undefined
    },
    validate: {
      title: validateMessages.title,
      description: {
        id: 'v2.review.validate.description.incomplete',
        defaultMessage:
          'Please add mandatory information before sending for approval',
        description: 'The description for validate action when form is complete'
      },
      onConfirm: validateMessages.onConfirm,
      onReject: validateMessages.onReject,
      modal: undefined
    },
    declare: {
      title: {
        id: 'v2.review.declare.title.incomplete',
        defaultMessage: 'Declaration incomplete',
        description:
          'The title shown when reviewing an incomplete record to declare'
      },
      description: {
        id: 'v2.review.declare.description.incomplete',
        defaultMessage:
          'The informant will receive an email with a tracking ID that they can use to provide the additional mandatory information required for registration',
        description: 'The description for declare action when form is complete'
      },
      onConfirm: declareMessages.onConfirm,
      modal: confirmModalMessages.incomplete.declare
    }
  }
}

/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
graphic logo are (registered/a) trademark(s) of Plan International.
*/
const {
  upsertChannel,
  removeChannel,
  newChannelTemplate
} = require('../../utils/openhim-helpers.cjs')

const marriageNewDeclarationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> New Marriage Declaration',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> New Marriage Declaration',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'New Marriage Declaration',
  urlPattern: '^/events/marriage/new-declaration$'
}

const marriageInProgressDeclarationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> New Marriage InProgress',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> New Marriage InProgress',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'New Marriage InProgress',
  urlPattern: '^/events/marriage/in-progress-declaration$'
}

const marriageRequestForRegistrarValidationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Request for Registrar Validation',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Request for Registrar Validation',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Request for Registrar Validation',
  urlPattern: '^/events/marriage/request-for-registrar-validation$'
}

const marriageWaitingExternalResourceValidationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Waiting External Resource Validation',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Waiting External Resource Validation',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Waiting External Resource Validation',
  urlPattern: '^/events/marriage/waiting-external-resource-validation$'
}

const registrarMarriageRegistrationWaitingExternalResourceValidationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Registrar Marriage Registration Waiting External Resource Validation',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Registrar Marriage Registration Waiting External Resource Validation',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Registrar Marriage Registration Waiting External Resource Validation',
  urlPattern:
    '^/events/marriage/registrar-registration-waiting-external-resource-validation$'
}

const marriageRegistrationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Registration',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Registration',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Webhooks -> Marriage Registration',
      secured: false,
      host: 'metrics',
      port: 2525,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Registration',
  urlPattern: '^/events/marriage/mark-registered$'
}

const marriageValidationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Validation',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Validation',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Validation',
  urlPattern: '^/events/marriage/mark-validated$'
}

const marriageCertificationChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Certification',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Certification',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Certification',
  urlPattern: '^/events/marriage/mark-certification$'
}

const marriageRejectionChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Rejection',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Rejection',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Rejection',
  urlPattern: '^/events/marriage/mark-void$'
}

const marriageArchiveChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Archive',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Archive',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Archive',
  urlPattern: '^/events/marriage/mark-archived$'
}

const marriageReinstateChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Reinstate',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Reinstate',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Archive',
  urlPattern: '^/events/marriage/mark-reinstated$'
}

const marriageRequestCorrectionChannel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Request Correction',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Marriage Request Correction',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Request Correction',
  urlPattern: '^/events/marriage/request-correction$'
}

exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, marriageNewDeclarationChannel)
      await upsertChannel(db, marriageInProgressDeclarationChannel)
      await upsertChannel(db, marriageRequestForRegistrarValidationChannel)
      await upsertChannel(db, marriageWaitingExternalResourceValidationChannel)
      await upsertChannel(
        db,
        registrarMarriageRegistrationWaitingExternalResourceValidationChannel
      )
      await upsertChannel(db, marriageRegistrationChannel)
      await upsertChannel(db, marriageValidationChannel)
      await upsertChannel(db, marriageCertificationChannel)
      await upsertChannel(db, marriageRejectionChannel)
      await upsertChannel(db, marriageArchiveChannel)
      await upsertChannel(db, marriageReinstateChannel)
      await upsertChannel(db, marriageRequestCorrectionChannel)
    })
  } finally {
    await session.endSession()
  }
}

exports.down = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await removeChannel(db, marriageNewDeclarationChannel)
      await removeChannel(db, marriageInProgressDeclarationChannel)
      await removeChannel(db, marriageRequestForRegistrarValidationChannel)
      await removeChannel(db, marriageWaitingExternalResourceValidationChannel)
      await removeChannel(
        db,
        registrarMarriageRegistrationWaitingExternalResourceValidationChannel
      )
      await removeChannel(db, marriageRegistrationChannel)
      await removeChannel(db, marriageValidationChannel)
      await removeChannel(db, marriageCertificationChannel)
      await removeChannel(db, marriageRejectionChannel)
      await removeChannel(db, marriageArchiveChannel)
      await removeChannel(db, marriageReinstateChannel)
      await removeChannel(db, marriageRequestCorrectionChannel)
    })
  } finally {
    await session.endSession()
  }
}

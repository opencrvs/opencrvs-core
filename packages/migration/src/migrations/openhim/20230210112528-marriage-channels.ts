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
import {
  upsertChannel,
  removeChannel,
  newChannelTemplate,
  routeTemplate,
  Channel
} from '../../utils/openhim-helpers.js'
import { Db, MongoClient } from 'mongodb'

const marriageNewDeclarationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> New Marriage Declaration',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> New Marriage Declaration',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'New Marriage Declaration',
  urlPattern: '^/events/marriage/new-declaration$'
}

const marriageInProgressDeclarationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> New Marriage InProgress',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> New Marriage InProgress',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'New Marriage InProgress',
  urlPattern: '^/events/marriage/in-progress-declaration$'
}

const marriageRequestForRegistrarValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Request for Registrar Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Request for Registrar Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Request for Registrar Validation',
  urlPattern: '^/events/marriage/request-for-registrar-validation$'
}

const marriageWaitingExternalResourceValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Waiting External Resource Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Waiting External Resource Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Waiting External Resource Validation',
  urlPattern: '^/events/marriage/waiting-external-resource-validation$'
}

const registrarMarriageRegistrationWaitingExternalResourceValidationChannel: Channel =
  {
    ...newChannelTemplate,
    routes: [
      {
        ...routeTemplate,
        name: 'Search -> Registrar Marriage Registration Waiting External Resource Validation',
        host: 'search',
        port: 9090,
        primary: true
      },
      {
        ...routeTemplate,
        name: 'Metrics -> Registrar Marriage Registration Waiting External Resource Validation',
        host: 'metrics',
        port: 1050,
        primary: false
      }
    ],
    name: 'Registrar Marriage Registration Waiting External Resource Validation',
    urlPattern:
      '^/events/marriage/registrar-registration-waiting-external-resource-validation$'
  }

const marriageRegistrationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Registration',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Registration',
      host: 'metrics',
      port: 1050,
      primary: false
    },
    {
      ...routeTemplate,
      name: 'Webhooks -> Marriage Registration',
      host: 'webhooks',
      port: 2525,
      primary: false
    }
  ],
  name: 'Marriage Registration',
  urlPattern: '^/events/marriage/mark-registered$'
}

const marriageValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Validation',
  urlPattern: '^/events/marriage/mark-validated$'
}

const marriageCertificationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Certification',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Certification',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Certification',
  urlPattern: '^/events/marriage/mark-certified$'
}

const marriageRejectionChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Rejection',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Rejection',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Rejection',
  urlPattern: '^/events/marriage/mark-voided$'
}

const marriageArchiveChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Archive',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Archive',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Archive',
  urlPattern: '^/events/marriage/mark-archived$'
}

const marriageReinstateChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Reinstate',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Reinstate',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Reinstate',
  urlPattern: '^/events/marriage/mark-reinstated$'
}

const marriageRequestCorrectionChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Request Correction',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Request Correction',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Request Correction',
  urlPattern: '^/events/marriage/request-correction$'
}

const marriageCertificateIssueChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      name: 'Metrics -> Marriage Issue',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: '',
      forwardAuthHeader: true,
      status: 'enabled',
      type: 'http'
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Marriage Issue',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    }
  ],
  name: 'Marriage Issue',
  urlPattern: '^/events/marriage/mark-issued$'
}

export const up = async (db: Db, client: MongoClient) => {
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
      await upsertChannel(db, marriageCertificateIssueChannel)
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
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
      await removeChannel(db, marriageCertificateIssueChannel)
    })
  } finally {
    await session.endSession()
  }
}

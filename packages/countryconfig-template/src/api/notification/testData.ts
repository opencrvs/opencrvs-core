import { Recipient, TriggerEvent } from '@opencrvs/toolkit/notification'
import { UUID, DocumentPath } from '@opencrvs/toolkit/events'
import { TriggerEventPayloadPair } from './handler'
import {
  Action,
  ActionStatus,
  ActionType,
  CreatedAction,
  EventDocument
} from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'

const recipient: Recipient = {
  name: {
    firstname: 'John',
    surname: 'Doe'
  },
  email: 'john.doe@gmail.com',
  mobile: '+15551234567'
}

export const userNotificationTestData: TriggerEventPayloadPair[] = [
  {
    event: 'user-created',
    payload: {
      recipient,
      username: 'j.doe',
      temporaryPassword: 'TempPass123!'
    }
  },
  {
    event: 'user-updated',
    payload: {
      recipient,
      oldUsername: 'z.roronoa',
      newUsername: 'j.doe'
    }
  },
  {
    event: 'username-reminder',
    payload: {
      recipient,
      username: 'j.doe'
    }
  },
  {
    event: '2fa',
    payload: {
      recipient,
      code: '102030'
    }
  },
  {
    event: 'reset-password',
    payload: {
      recipient,
      code: '112233'
    }
  },
  {
    event: 'reset-password-by-admin',
    payload: {
      recipient,
      temporaryPassword: 'tempPass123',
      admin: {
        name: {
          firstname: 'Kennedy',
          surname: 'Campbell'
        },
        id: 'admin',
        role: 'NATIONAL_SYSTEM_ADMIN'
      }
    }
  },
  {
    event: 'resend-invite',
    payload: {
      recipient,
      username: 'j.doe',
      temporaryPassword: 'TempPass123!'
    }
  },
  {
    event: TriggerEvent.CHANGE_EMAIL_ADDRESS,
    payload: {
      recipient,
      code: '654321'
    }
  },
  {
    event: TriggerEvent.CHANGE_PHONE_NUMBER,
    payload: {
      recipient,
      code: '123456'
    }
  }
]

const CreateAction = {
  id: '596a6a01-5070-4b4d-bed4-949a33212b6e' as unknown as UUID,
  transactionId: 'tmp-0c1a550f-4537-4e15-bde1-649157fd1c52',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:04.815Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  status: ActionStatus.Accepted,
  type: ActionType.CREATE
} satisfies CreatedAction

const AssignAction = {
  id: 'f2262859-71f8-4604-bea9-7e24fcced788' as unknown as UUID,
  transactionId: 'tmp-0c1a550f-4537-4e15-bde1-649157fd1c52',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:04.815Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  status: 'Accepted',
  type: 'ASSIGN',
  assignedTo: '68a33795caf0b9e13a86d51f'
} satisfies Action

const RequestBirthNotificationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bf-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.NOTIFY
} satisfies Action

const RequestBirthDeclarationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.DECLARE
} satisfies Action

const BirthDeclarationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Accepted,
  type: ActionType.DECLARE
} satisfies Action

const RequestRegistrationAction = {
  id: 'e4ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7d194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.REGISTER
} satisfies Action

const RequestRejectionAction = {
  id: 'e4ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7d194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'HOSPITAL_CLERK',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  annotation: {},
  content: { reason: 'False Data' },
  status: ActionStatus.Requested,
  type: ActionType.REJECT
} satisfies Action

const RequestDeathNotificationAction = {
  id: '9ff9189c-f736-407e-916f-1342b3d2beac' as unknown as UUID,
  transactionId: 'cc240165-b431-41ae-8a31-bae46f40b088',
  createdByUserType: 'user',
  createdAt: '2025-08-20T09:43:55.734Z',
  createdBy: '68a33796caf0b9e13a86d52f',
  createdByRole: 'LOCAL_REGISTRAR',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'spouse.name': {
      firstname: 'Toki',
      surname: 'Kozuki',
      middlename: ''
    },
    'deceased.name': {
      firstname: 'Oden',
      surname: 'Kozuki',
      middlename: ''
    },
    'deceased.idType': 'NONE',
    'informant.email': 'toki@kozuki.com',
    'informant.phoneNo': '0734231245',

    'deceased.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'informant.relation': 'SPOUSE'
  },
  annotation: {
    'review.comment': 'Kaido killed him',
    'review.signature': {
      path: '41db20ff-4084-4e09-8343-f8c962261e32/370dff69-5478-4424-bf74-57fff2eaf865.png' as DocumentPath,
      originalFilename: 'signature-review____signature-1755683031251.png',
      type: 'image/png'
    }
  },
  status: ActionStatus.Requested,
  type: ActionType.NOTIFY
} satisfies Action

const RequestDeathDeclarationAction = {
  id: '9ff9189c-f736-407e-916f-1342b3d2beac' as unknown as UUID,
  transactionId: 'cc240165-b431-41ae-8a31-bae46f40b088',
  createdByUserType: 'user',
  createdAt: '2025-08-20T09:43:55.734Z',
  createdBy: '68a33796caf0b9e13a86d52f',
  createdByRole: 'LOCAL_REGISTRAR',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'spouse.age': { age: 41, asOfDateRef: 'eventDetails.date' },
    'spouse.name': {
      firstname: 'Toki',
      surname: 'Kozuki',
      middlename: ''
    },
    'deceased.age': { age: 31, asOfDateRef: 'eventDetails.date' },
    'deceased.name': {
      firstname: 'Oden',
      surname: 'Kozuki',
      middlename: ''
    },
    'spouse.idType': 'NONE',
    'deceased.gender': 'male',
    'deceased.idType': 'NONE',
    'informant.email': 'toki@kozuki.com',
    'informant.phoneNo': '0734231245',

    'deceased.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'eventDetails.date': '2025-08-19',
    'spouse.dobUnknown': true,
    'informant.relation': 'SPOUSE',
    'spouse.nationality': 'FAR',
    'deceased.dobUnknown': true,
    'deceased.nationality': 'FAR',
    'spouse.addressSameAs': 'YES',
    'eventDetails.placeOfDeath': 'DECEASED_USUAL_RESIDENCE',
    'eventDetails.causeOfDeathEstablished': false
  },
  annotation: {
    'review.comment': 'Kaido killed him',
    'review.signature': {
      path: '41db20ff-4084-4e09-8343-f8c962261e32/370dff69-5478-4424-bf74-57fff2eaf865.png' as DocumentPath,
      originalFilename: 'signature-review____signature-1755683031251.png',
      type: 'image/png'
    }
  },
  status: ActionStatus.Requested,
  type: ActionType.DECLARE
} satisfies Action

const DeathDeclarationAction = {
  id: '9ff9189c-f736-407e-916f-1342b3d2beac' as unknown as UUID,
  transactionId: 'cc240165-b431-41ae-8a31-bae46f40b088',
  createdByUserType: 'user',
  createdAt: '2025-08-20T09:43:55.734Z',
  createdBy: '68a33796caf0b9e13a86d52f',
  createdByRole: 'LOCAL_REGISTRAR',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'spouse.age': { age: 41, asOfDateRef: 'eventDetails.date' },
    'spouse.name': {
      firstname: 'Toki',
      surname: 'Kozuki',
      middlename: ''
    },
    'deceased.age': { age: 31, asOfDateRef: 'eventDetails.date' },
    'deceased.name': {
      firstname: 'Oden',
      surname: 'Kozuki',
      middlename: ''
    },
    'spouse.idType': 'NONE',
    'deceased.gender': 'male',
    'deceased.idType': 'NONE',
    'informant.email': 'toki@kozuki.com',
    'informant.phoneNo': '0734231245',

    'deceased.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284'
    },
    'eventDetails.date': '2025-08-19',
    'spouse.dobUnknown': true,
    'informant.relation': 'SPOUSE',
    'spouse.nationality': 'FAR',
    'deceased.dobUnknown': true,
    'deceased.nationality': 'FAR',
    'spouse.addressSameAs': 'YES',
    'eventDetails.placeOfDeath': 'DECEASED_USUAL_RESIDENCE',
    'eventDetails.causeOfDeathEstablished': false
  },
  annotation: {
    'review.comment': 'Kaido killed him',
    'review.signature': {
      path: '41db20ff-4084-4e09-8343-f8c962261e32/370dff69-5478-4424-bf74-57fff2eaf865.png' as DocumentPath,
      originalFilename: 'signature-review____signature-1755683031251.png',
      type: 'image/png'
    }
  },
  status: ActionStatus.Accepted,
  type: ActionType.DECLARE
} satisfies Action

const birthNotificationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestBirthNotificationAction],
  trackingId: 'PRZIB7'
}

const birthDeclarationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestBirthDeclarationAction],
  trackingId: 'PRZIB7'
}

const birthRegistrationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    BirthDeclarationAction,
    RequestRegistrationAction
  ],
  trackingId: 'PRZIB7'
}

const birthRejectionEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    BirthDeclarationAction,
    RequestRejectionAction
  ],
  trackingId: 'PRZIB7'
}

const deathNotificationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: Event.Death,
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestDeathNotificationAction],
  trackingId: 'PRZIB7'
}

const deathDeclarationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: Event.Death,
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestDeathDeclarationAction],
  trackingId: 'PRZIB7'
}

const deathRegistrationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: Event.Death,
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    DeathDeclarationAction,
    RequestRegistrationAction
  ],
  trackingId: 'PRZIB7'
}

const deathRejectionEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: Event.Death,
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    DeathDeclarationAction,
    RequestRejectionAction
  ],
  trackingId: 'PRZIB7'
}

export const informantNotificationTestData: {
  eventType: string
  actionType: ActionType
  eventDocument: EventDocument
}[] = [
    {
      eventType: Event.Birth,
      actionType: ActionType.NOTIFY,
      eventDocument: birthNotificationEvent
    },
    {
      eventType: Event.Birth,
      actionType: ActionType.DECLARE,
      eventDocument: birthDeclarationEvent
    },
    {
      eventType: Event.Birth,
      actionType: ActionType.REGISTER,
      eventDocument: birthRegistrationEvent
    },
    {
      eventType: Event.Birth,
      actionType: ActionType.REJECT,
      eventDocument: birthRejectionEvent
    },
    {
      eventType: Event.Death,
      actionType: ActionType.NOTIFY,
      eventDocument: deathNotificationEvent
    },
    {
      eventType: Event.Death,
      actionType: ActionType.DECLARE,
      eventDocument: deathDeclarationEvent
    },
    {
      eventType: Event.Death,
      actionType: ActionType.REGISTER,
      eventDocument: deathRegistrationEvent
    },
    {
      eventType: Event.Death,
      actionType: ActionType.REJECT,
      eventDocument: deathRejectionEvent
    }
  ]

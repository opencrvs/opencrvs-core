/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { gqlToDraftTransformer } from '@client/transformer'
import { IStoreState } from '@client/store'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { IForm } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import { IUserDetails } from '@client/utils/userUtils'
import { userDetails } from '@client/tests/util'
import { formatAllNonStringValues } from '@client/views/PrintCertificate/PDFUtils'
import { IntlShape } from 'react-intl'

const dummyBirthRegistrationResponse = `{
  "_fhirIDMap": {
    "composition": "1e09f4b5-43f4-415c-b2ab-f24a4b0be20a",
    "encounter": "65f436b8-562a-4a35-8df9-ff41205a7770",
    "eventLocation": "5c6abc88-26b8-4834-a1a6-2992807e3a72",
    "observation": {
      "presentAtBirthRegistration": "b84da113-f463-4ffd-a7f5-b4055b6275dc"
    }
  },
  "id": "1e09f4b5-43f4-415c-b2ab-f24a4b0be20a",
  "child": {
    "id": "21e12ec4-65a3-4f13-ab32-3c8580359c05",
    "multipleBirth": 3,
    "name": [
      {
        "use": "en",
        "firstNames": "Test Application",
        "familyName": "Will Be Updated",
        "__typename": "HumanName"
      }
    ],
    "birthDate": "2021-05-19",
    "gender": "male",
    "__typename": "Person"
  },
  "mother": {
    "id": "b7793115-0d7f-44d8-89ba-7051e8d4bc29",
    "name": [
      {
        "use": "en",
        "firstNames": "",
        "familyName": "Will Be Updated",
        "__typename": "HumanName"
      }
    ],
    "birthDate": null,
    "maritalStatus": "MARRIED",
    "dateOfMarriage": null,
    "educationalAttainment": null,
    "nationality": [
      "FAR"
    ],
    "occupation": null,
    "identifier": [
      {
        "id": "123456879",
        "type": "NATIONAL_ID",
        "otherType": null,
        "__typename": "IdentityType"
      }
    ],
    "address": [
      {
        "type": "PLACE_OF_HERITAGE",
        "line": [
          "",
          "",
          "",
          "",
          "",
          ""
        ],
        "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "state": "df669feb-61a3-4984-ab24-4b28511b472a",
        "city": null,
        "postalCode": null,
        "country": "FAR",
        "__typename": "Address"
      },
      {
        "type": "PERMANENT",
        "line": [
          "",
          "",
          "",
          "",
          "",
          "",
          "URBAN"
        ],
        "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "state": "df669feb-61a3-4984-ab24-4b28511b472a",
        "city": null,
        "postalCode": null,
        "country": "FAR",
        "__typename": "Address"
      },
      {
        "type": "CURRENT",
        "line": [
          "",
          "",
          "",
          "",
          "",
          "",
          "URBAN"
        ],
        "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "state": "df669feb-61a3-4984-ab24-4b28511b472a",
        "city": null,
        "postalCode": null,
        "country": "FAR",
        "__typename": "Address"
      }
    ],
    "telecom": null,
    "__typename": "Person"
  },
  "father": null,
  "informant": null,
  "primaryCaregiver": {
    "parentDetailsType": null,
    "primaryCaregiver": null,
    "reasonsNotApplying": [
      {
        "primaryCaregiverType": null,
        "reasonNotApplying": null,
        "isDeceased": null,
        "__typename": "ReasonsNotApplying"
      }
    ],
    "__typename": "PrimaryCaregiver"
  },
  "registration": {
    "id": "f2580a50-58d7-4946-b15b-ed638c87bf30",
    "contact": "MOTHER",
    "contactPhoneNumber": "+260965656868",
    "status": [
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-24T12:16:07.954Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      }
    ],
    "trackingId": "BLOQITK",
    "registrationNumber": "2022BLOQITK",
    "__typename": "Registration"
  },
  "attendantAtBirth": null,
  "weightAtBirth": null,
  "birthType": null,
  "questionnaire": null,
  "eventLocation": {
    "type": "HEALTH_FACILITY",
    "address": {
      "line": [],
      "district": null,
      "state": null,
      "city": null,
      "postalCode": null,
      "country": null,
      "__typename": "Address"
    },
    "__typename": "Location"
  },
  "presentAtBirthRegistration": "MOTHER",
  "history": [
    {
      "date": "2022-03-25T12:19:25.860+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T10:07:26.988+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T06:55:46.119+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T06:36:17.234+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T05:53:43.728+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T05:53:07.817+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T13:35:14.047+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T13:21:06.687+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T13:10:36.259+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:50:10.340+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:31:50.360+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:29:48.346+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:16:13.229+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:16:08.295+00:00",
      "action": "REGISTERED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-24T12:16:08.173+00:00",
      "action": "WAITING_VALIDATION",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    }
  ],
  "__typename": "BirthRegistration"
}`

const dummyDeathRegistrationResponse = `{
  "_fhirIDMap": {
    "composition": "70620dec-57db-4d57-bb54-dbc3a6447fa7"
  },
  "id": "70620dec-57db-4d57-bb54-dbc3a6447fa7",
  "deceased": {
    "id": "0673acaa-8843-4d16-b21d-ce8eb95c10c7",
    "name": [
      {
        "use": "en",
        "firstNames": "Courage",
        "familyName": "The Cowardly Dog",
        "__typename": "HumanName"
      }
    ],
    "birthDate": "2000-02-19",
    "age": null,
    "gender": "male",
    "maritalStatus": "MARRIED",
    "nationality": [
      "FAR"
    ],
    "identifier": [
      {
        "id": "123456789",
        "type": "NATIONAL_ID",
        "otherType": null,
        "__typename": "IdentityType"
      },
      {
        "id": "2",
        "type": "SOCIAL_SECURITY_NO",
        "otherType": null,
        "__typename": "IdentityType"
      },
      {
        "id": "2022D0FLRZW",
        "type": "DEATH_REGISTRATION_NUMBER",
        "otherType": null,
        "__typename": "IdentityType"
      }
    ],
    "deceased": {
      "deathDate": "2020-02-15",
      "__typename": "Deceased"
    },
    "address": [
      {
        "type": "PERMANENT",
        "line": [
          "",
          "",
          "",
          "",
          "",
          "",
          "URBAN"
        ],
        "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "state": "df669feb-61a3-4984-ab24-4b28511b472a",
        "city": null,
        "postalCode": null,
        "country": "FAR",
        "__typename": "Address"
      }
    ],
    "__typename": "Person"
  },
  "informant": {
    "id": "0b057225-a1fd-43a5-868f-5066fb01691c",
    "relationship": "SPOUSE",
    "otherRelationship": null,
    "individual": {
      "id": "741f16ac-28fe-4de7-9d3c-dc9e180fa1c8",
      "identifier": [
        {
          "id": "123456888",
          "type": "NATIONAL_ID",
          "otherType": null,
          "__typename": "IdentityType"
        }
      ],
      "name": [
        {
          "use": "en",
          "firstNames": "Test Application",
          "familyName": "Will Be Updated",
          "__typename": "HumanName"
        }
      ],
      "nationality": [
        "FAR"
      ],
      "occupation": null,
      "birthDate": null,
      "telecom": null,
      "address": [
        {
          "type": "PERMANENT",
          "line": [
            "",
            "",
            "",
            "",
            "",
            "",
            "URBAN"
          ],
          "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
          "state": "df669feb-61a3-4984-ab24-4b28511b472a",
          "city": null,
          "postalCode": null,
          "country": "FAR",
          "__typename": "Address"
        }
      ],
      "__typename": "Person"
    },
    "__typename": "RelatedPerson"
  },
  "father": {
    "id": "f1918aae-4703-4075-8e92-906a249cfbc5",
    "name": [
      {
        "use": "en",
        "firstNames": "",
        "familyName": "Bagge",
        "__typename": "HumanName"
      }
    ],
    "__typename": "Person"
  },
  "mother": {
    "id": "6a0702a5-81a8-492c-8e49-64578509dcef",
    "name": [
      {
        "use": "en",
        "firstNames": "",
        "familyName": "Bagge",
        "__typename": "HumanName"
      }
    ],
    "__typename": "Person"
  },
  "spouse": null,
  "medicalPractitioner": null,
  "registration": {
    "id": "a288f6d2-7aa5-4572-8b1b-af7ca3ce0a78",
    "contact": "SPOUSE",
    "contactRelationship": null,
    "contactPhoneNumber": "+260965656868",
    "status": [
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-25T12:30:34.337Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "REGISTERED",
        "timestamp": "2022-03-25T12:30:34.337Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      },
      {
        "comments": null,
        "type": "WAITING_VALIDATION",
        "timestamp": "2022-03-25T12:30:34.337Z",
        "location": {
          "name": "Ibombo",
          "alias": [
            "Ibombo"
          ],
          "__typename": "Location"
        },
        "office": {
          "name": "Ibombo District Office",
          "alias": [
            "Ibombo District Office"
          ],
          "address": {
            "district": "Ibombo District",
            "state": "Central Province",
            "__typename": "Address"
          },
          "__typename": "Location"
        },
        "__typename": "RegWorkflow"
      }
    ],
    "type": "DEATH",
    "trackingId": "D0FLRZW",
    "registrationNumber": "2022D0FLRZW",
    "__typename": "Registration"
  },
  "questionnaire": null,
  "eventLocation": {
    "id": "f0517084-664e-434c-8ed3-2dc58ceabcfb",
    "type": "PERMANENT",
    "address": {
      "type": "PERMANENT",
      "line": [
        "",
        "",
        "",
        "",
        "",
        "",
        "URBAN"
      ],
      "district": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
      "state": "df669feb-61a3-4984-ab24-4b28511b472a",
      "city": null,
      "postalCode": null,
      "country": "FAR",
      "__typename": "Address"
    },
    "__typename": "Location"
  },
  "mannerOfDeath": "NATURAL_CAUSES",
  "causeOfDeathMethod": null,
  "causeOfDeath": null,
  "maleDependentsOfDeceased": null,
  "femaleDependentsOfDeceased": null,
  "history": [
    {
      "date": "2022-03-25T12:30:51.727+00:00",
      "action": "DOWNLOADED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T12:30:34.653+00:00",
      "action": "REGISTERED",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    },
    {
      "date": "2022-03-25T12:30:34.597+00:00",
      "action": "WAITING_VALIDATION",
      "reinstated": false,
      "location": {
        "id": "ecc5a78b-e7d9-4640-ac65-e591a6a9590f",
        "name": "Ibombo",
        "__typename": "Location"
      },
      "office": {
        "id": "4bf3e2ac-99f5-468c-b974-966f725aaab0",
        "name": "Ibombo District Office",
        "__typename": "Location"
      },
      "user": {
        "id": "622f81b42cd537bf91daa106",
        "type": "CHAIRMAN",
        "role": "LOCAL_REGISTRAR",
        "name": [
          {
            "firstNames": "Kennedy",
            "familyName": "Mweene",
            "use": "en",
            "__typename": "HumanName"
          }
        ],
        "avatar": null,
        "__typename": "User"
      },
      "comments": [],
      "input": [],
      "output": [],
      "certificates": null,
      "__typename": "History"
    }
  ],
  "__typename": "DeathRegistration"
}`

export const getDummyCertificateTemplateData = (
  event: string,
  registerForm: { birth: IForm; death: IForm },
  offlineData: IOfflineData,
  userDetails: IUserDetails,
  intl: IntlShape
) => {
  let response: string, form: IForm
  if (event === 'birth') {
    response = dummyBirthRegistrationResponse
    form = registerForm.birth
  } else {
    response = dummyDeathRegistrationResponse
    form = registerForm.death
  }
  const declaration = gqlToDraftTransformer(
    form,
    JSON.parse(response),
    offlineData,
    userDetails
  )

  return formatAllNonStringValues(
    declaration.template as Record<string, any>,
    intl
  )
}

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
import { GetSystemRolesQuery, SystemRoleType } from '@client/utils/gateway'

const systemRoles: GetSystemRolesQuery = {
  getSystemRoles: [
    {
      id: '63c7ebee48dc29888b5b020d',
      value: SystemRoleType.FieldAgent,
      roles: [
        {
          _id: '63ef9466f708ea080777c279',
          labels: [
            {
              lang: 'en',
              label: 'Health Worker',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Professionnel de Santé',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        },
        {
          _id: '63ef9466f708ea080777c27a',
          labels: [
            {
              lang: 'en',
              label: 'Police Worker',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Agent de Police',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        },
        {
          _id: '63ef9466f708ea080777c27b',
          labels: [
            {
              lang: 'en',
              label: 'Social Worker',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Travailleur Social',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        },
        {
          _id: '63ef9466f708ea080777c27c',
          labels: [
            {
              lang: 'en',
              label: 'Local Leader',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Leader Local',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b020e',
      value: SystemRoleType.RegistrationAgent,
      roles: [
        {
          _id: '63ef9466f708ea080777c27d',
          labels: [
            {
              lang: 'en',
              label: 'Registration Agent',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: "Agent d'enregistrement",
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b020f',
      value: SystemRoleType.LocalRegistrar,
      roles: [
        {
          _id: '63ef9466f708ea080777c27e',
          labels: [
            {
              lang: 'en',
              label: 'Local Registrar',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Registraire local',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b0210',
      value: SystemRoleType.LocalSystemAdmin,
      roles: [
        {
          _id: '63ef9466f708ea080777c27f',
          labels: [
            {
              lang: 'en',
              label: 'Local System Admin',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Administrateur système local',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b0211',
      value: SystemRoleType.NationalSystemAdmin,
      roles: [
        {
          _id: '63ef9466f708ea080777c280',
          labels: [
            {
              lang: 'en',
              label: 'National System Admin',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Administrateur système national',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b0212',
      value: SystemRoleType.PerformanceManagement,
      roles: [
        {
          _id: '63ef9466f708ea080777c281',
          labels: [
            {
              lang: 'en',
              label: 'Performance Manager',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Gestion des performances',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    },
    {
      id: '63c7ebee48dc29888b5b0213',
      value: SystemRoleType.NationalRegistrar,
      roles: [
        {
          _id: '63ef9466f708ea080777c282',
          labels: [
            {
              lang: 'en',
              label: 'National Registrar',
              __typename: 'RoleLabel'
            },
            {
              lang: 'fr',
              label: 'Registraire national',
              __typename: 'RoleLabel'
            }
          ],
          __typename: 'Role'
        }
      ],
      __typename: 'SystemRole'
    }
  ]
}

export default systemRoles

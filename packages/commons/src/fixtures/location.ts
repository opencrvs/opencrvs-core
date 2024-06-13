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

import { ResourceIdentifier, SavedLocation } from '../fhir'
import { UUID } from '../uuid'

const defaultSavedLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/internal-id',
      value: 'CRVS_OFFICE_JWMRGwDBXK'
    }
  ],
  name: 'Ibombo District Office',
  alias: ['Ibombo District Office'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference:
      'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'CRVS_OFFICE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  },
  meta: {
    lastUpdated: '2023-09-13T12:36:08.749+00:00',
    versionId: 'ebe887c3-35fd-4af3-9163-c4decf93797f'
  },
  id: 'e9e1b362-27c9-4ce1-82ad-57fe9d5650e4' as UUID
}

export function savedLocation(overrides = {} as Partial<SavedLocation>) {
  return { ...defaultSavedLocation, ...overrides } as SavedLocation
}

const defaultAdministrativeLocation = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/statistical-code',
      value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
    },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'DISTRICT'
    }
  ],
  name: 'Ibombo',
  alias: ['Ibombo'],
  description: 'oEBf29y8JP8',
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/0' as ResourceIdentifier
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'ADMIN_STRUCTURE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'jdn',
        display: 'Jurisdiction'
      }
    ]
  },
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
      valueAttachment: {
        contentType: 'application/geo+json',
        data: '<base64>'
      }
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-male-populations',
      valueString:
        '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-female-populations',
      valueString:
        '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-total-populations',
      valueString:
        '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString:
        '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
    }
  ],
  meta: {
    lastUpdated: '2023-09-13T12:36:07.426+00:00',
    versionId: 'df1ba3bc-0ec3-4f5f-81ee-8a635019de0c'
  },

  id: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as UUID
}

export function savedAdministrativeLocation(
  overrides = {} as Partial<SavedLocation>
) {
  return { ...defaultAdministrativeLocation, ...overrides } as SavedLocation
}

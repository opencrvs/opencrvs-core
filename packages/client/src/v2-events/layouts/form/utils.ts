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

import { ROUTES } from '@client/v2-events/routes'

/**
 * @TODO: Check whether these could be derived dynamically from ROUTES config.
 * We do have the information of which routes have the eventId, so duplicating the information
 * here is not optimal.
 */
export type AllowedRouteWithEventId =
  | typeof ROUTES.V2.EVENTS.REGISTER
  | typeof ROUTES.V2.EVENTS.DECLARE
  | typeof ROUTES.V2.EVENTS.PRINT_CERTIFICATE
  | typeof ROUTES.V2.EVENTS.REQUEST_CORRECTION

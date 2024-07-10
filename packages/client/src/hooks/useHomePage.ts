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
import { REGISTRAR_HOME } from '@client/navigation/routes'
import { useLocation } from 'react-router'

// @TODO: Create a logic for figuring out which page the user needs to be redirected to
export const useHomePage = () => {
  const { pathname } = useLocation()

  return {
    path: REGISTRAR_HOME,
    isCurrentPageHome: pathname.startsWith(REGISTRAR_HOME)
  }
}

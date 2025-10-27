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

import { useNavigation } from '@client/hooks/useNavigation'

/**
 * Helper to check if the user has access to **hard-coded V1 non-workqueue** navigation items.
 * organisations / performance etc. views were out of scope for V2. However, we still need to be able to navigate to them, and show them in the sidebar.
 *
 *
 * @deprecated In 1.10 we move away from V1 navigation to country config defined navigation.
 * @returns a function to check if the user has  to a navigation item by name.
 */
export function useHasAccessToNavigationItem() {
  const { routes: scopedRoutes } = useNavigation()
  const hasAccess = (name: string): boolean =>
    scopedRoutes.some(
      (x) => x.name === name || x.tabs.some((t) => t.name === name)
    )

  return { hasAccess }
}

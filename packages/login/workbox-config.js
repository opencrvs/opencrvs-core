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
module.exports = {
  cacheId: 'ocrvs-login',
  globDirectory: 'build/',
  globIgnores: ['**/config.js'],
  globPatterns: ['**/*.{json,ico,ttf,html,js}'],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  navigateFallback: '/index.html',
  // fallback for anything that doesn't start with /__ which is used by cypress
  navigateFallbackBlacklist: [/^\/__.*$/],
  swDest: 'build/service-worker.js',
  /*
   * As the config file can change after the app is built, we cannot precache it
   * as we do with other assets. Instead, we use the NetworkFirst strategy that
   * tries to load the file, but falls back to the cached version. This version is updated
   * when a new version is succesfully loaded.
   * https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
   */
  runtimeCaching: [
    {
      // Match any same-origin request that contains 'api'.
      urlPattern: /config\.js/,
      // Apply a network-first strategy.
      handler: 'NetworkFirst'
    }
  ]
}

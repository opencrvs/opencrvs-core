module.exports = {
  cacheId: 'ocrvs-login',
  globDirectory: 'build/',
  globIgnores: ['**/config.js'],
  globPatterns: ['**/*.{json,ico,ttf,html,js}'],
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

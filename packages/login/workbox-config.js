module.exports = {
  cacheId: 'ocrvs-login',
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{json,ico,ttf,html,js}'
  ],
  navigateFallback: '/index.html',
  // fallback for anything that doesn't start with /__ which is used by cypress
  navigateFallbackBlacklist: [/^\/__.*$/],
  swDest: 'build/service-worker.js',
}

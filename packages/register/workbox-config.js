module.exports = {
  cacheId: 'ocrvs-register',
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{json,ico,ttf,html,js}'
  ],
  navigateFallback: '/index.html',
  navigateFallbackBlacklist: [/^\/__.*$/], // fallback for anything that doesn't start with /__ which is used by cypress
  swDest: 'build/service-worker.js'
}

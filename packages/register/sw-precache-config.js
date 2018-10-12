module.exports = {
  cacheId: 'ocrvs-register',
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [/^\/[^_]+$/], // fallback for anything that doesn't start with /__ which is used by cypress
  staticFileGlobs: [
    'build/**/*.js',
    'build/**/*.css',
    'build/index.html',
    'build/fonts/**/*'
  ]
}

module.exports = {
  globDirectory: 'build/',
  globPatterns: ['**/*.{json,ico,ttf,html,js}'],
  globIgnores: ['**/config.js'],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  swDest: 'build/service-worker.js',
  swSrc: 'src/src-sw.js'
}

/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:16:50 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:16:50 
 */
// Karma configuration
// Generated on Wed May 31 2017 21:31:20 GMT+0100 (BST)
const webpackEnv = {test: true}
const webpackConfig = require('./webpack.config')(webpackEnv)
const testGlob = 'src/**/*.test.js';
const sourceGlob = 'src/**/*!(test|stub).js';
process.env.BABEL_ENV = 'test';

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [testGlob, sourceGlob],

    preprocessors: {
      [testGlob]: ['webpack'],
      [sourceGlob]: ['webpack'],
    },
    webpack: webpackConfig,
    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      reporters: [
        {type: 'lcov', dir: 'coverage/', subdir: '.'},
        {type: 'json', dir: 'coverage/', subdir: '.'},
        {type: 'text-summary'},
      ],
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

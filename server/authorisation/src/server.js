/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:13:53 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:13:53 
 */
require( 'babel-core/register' );
const Hapi = require('hapi');
const Glue = require('glue');
const Labbable = require('labbable');
const labbable = module.exports = new Labbable();
const Manifest = require('./config/manifest');

const server = new Hapi.Server();

Glue.compose(

    Manifest.get('/'),
    {
        relativeTo: __dirname
    },
    (err, server) => {

        // $lab:coverage:off$
        if (err) {
            throw err;
        }
        // $lab:coverage:on$

        // Step 2.
        // Show the server to our instance of labbable
        labbable.using(server);

        // Step 3.
        // Initialize your server
        server.initialize((err) => {

            // $lab:coverage:off$
            if (err) {
                throw err;
            }

            // Don't continue to start server if module
            // is being require()'d (likely in a test)
            // $lab:coverage:off$
            if (module.parent) {
                return;
            }

            server.start((err) => {

                if (err) {
                    throw err;
                }
            });
            // $lab:coverage:on$
        });
    }
);


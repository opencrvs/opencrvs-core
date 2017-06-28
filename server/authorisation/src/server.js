import Hapi from 'hapi';
import Glue from 'glue';

const server = new Hapi.Server();
const Manifest = require('./config/manifest');

Glue.compose(

    Manifest.get('/'),
    {
        relativeTo: __dirname
    },
    (err, server) => {

        if (err) {
            throw err;
        }
        else {
            server.start((err) => {

                if (err) {
                    throw err;
                }
                else {
                    console.log('Web App running.');
                    resolve(server);
                }
            });
        }
    }
);



const Code        = require('code');
const expect      = Code.expect;
const Lab         = require('lab');
const lab         = exports.lab = Lab.script();

// use some BDD verbage instead of lab default
const describe    = lab.describe;
const it          = lab.it;
const after       = lab.after;

// require hapi server
const Server = require('../../bootstrap');

// tests
describe('functional tests - login', () => {

    it('should login', (done) => {

        // make API call to self to test functionality end-to-end
        Server.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                username: 'lindataylor',
                password: '2675KC2903tD80E'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.token);
            done();
        });
    });

    after((done) => {

        // placeholder to do something post tests
        done();
    });
});

describe('functional tests - get documentation', () => {

    it('should return documentation html', (done) => {

        // make API call to self to test functionality end-to-end
        Server.inject({
            method: 'GET',
            url: '/'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.a.string();
            done();
        });
    });

    after((done) => {

        // placeholder to do something post tests
        done();
    });
});

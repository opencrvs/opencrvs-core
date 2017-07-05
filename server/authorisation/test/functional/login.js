/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:13:44 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:13:44 
 */
const Code = require('code');
const expect = Code.expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
// const expect = Lab.expect;

const LabbableServer = require('../../src/server.js');

describe('functional tests - login', () => {

    let server;

    before((done) => {

        LabbableServer.ready((err, srv) => {

            if (err) {
                return done(err);
            }
            server = srv;
            return done();
        });
    });

    it('should login', (done) => {

        expect(server).to.exist();
        server.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                username: 'validator',
                password: 'plan2017'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            const result = response.result;
            expect(result.token).to.be.a.string();
            done();
        });
    });

    after((done) => {

        done();
    });
});

describe('functional tests - get documentation', () => {

    let server;
    before((done) => {

        LabbableServer.ready((err, srv) => {

            if (err) {
                return done(err);
            }
            server = srv;
            return done();
        });
    });

    it('should return documentation html', (done) => {

        server.inject({
            method: 'GET',
            url: '/docs'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.a.string();
            done();
        });
    });
    after((done) => {

        done();
    });
});

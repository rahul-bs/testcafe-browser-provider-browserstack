import Promise from 'pinkie';
import request from 'request-promise';
import * as ERROR_MESSAGES from '../templates/error-messages';
var fs = require('fs');
var yaml = require('js-yaml');
var dirpath = require('path');

const apiRequestPromise = Promise.resolve(null);

export default function (apiPath, params = {}) {
    // if (!process.env['BROWSERSTACK_USERNAME'] || !process.env['BROWSERSTACK_ACCESS_KEY'])
    //     throw new Error(ERROR_MESSAGES.BROWSERSTACK_AUTHENTICATION_FAILED());
    var fileContents = fs.readFileSync(dirpath.join(__dirname, '../credentials.yml'), 'utf8');
    var data = yaml.safeLoad(fileContents);

    var { body, executeImmediately, ...queryParams } = params;

    var opts = {
        url:  apiPath.url,
        auth: {
            user: data[process.argv[4]]['username'],
            pass: data[process.argv[4]]['key']
        },

        headers: {
            'user-agent': 'testcafe-browserstack',
        },

        qs: { ...queryParams },

        method: apiPath.method || 'GET',
        json:   apiPath.encoding === void 0
    };

    const proxy = process.env['BROWSERSTACK_PROXY'];

    if (proxy)
        opts.proxy = `http://${proxy}`;

    if (body)
        opts.body = body;

    if (apiPath.encoding !== void 0)
        opts.encoding = apiPath.encoding;

    const chainPromise = executeImmediately ? Promise.resolve(null) : apiRequestPromise;

    const currentRequestPromise = chainPromise
        .then(() => request(opts))
        .catch(error => {
            if (error.statusCode === 401)
                throw new Error(ERROR_MESSAGES.BROWSERSTACK_AUTHENTICATION_FAILED());

            throw error;
        });

    return currentRequestPromise;
}

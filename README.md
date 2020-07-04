# cuchito
**TitM *(test in the middle)* - made easy**

![cuchito-logo](assets/logo.svg)

## WARNING
This software is under intense development, this documentation it's not stable at all. Everithing could change.

Do not use in production. Use it to try out the concept, to give feedback and to help with the development.

## What is cuchito?

Cuchito is a **test in the middle** tool that helps developers, QAs and devops, in their daily tasks with a complete set of helpful features:

* **Manual stress test:** Connect cuchito between the front and the back, and make it multiply your API calls as many times as you need.
* **Automated stress test:** Save manual stress sessions so they can run later as unatended automated stress tests.
* **API schema validation:** Use [@hapi/joi](https://github.com/hapijs/joi) schema validations in the requests or responses to catch bugs
* **API test:** write tests easier than ever, and run then manually or automatically.
* **API mocking:** Replace or mutate request and responses, to try new features or edge cases for both the front and the back.
* **re-routing:** Re-route the paths, so you can merge different servers, environment, versions and endpoints in one API.
* **Real time config reload:** Change your session configuration on the fly.

## Quick guides

### First steps

#### Initialize a cuchito project
```
npm init cuchito foo
cd foo
```

#### Edit the file named `cuchito.js` to:

* set the field `host` to point to the API you want to stress.
* set the IP and port you want your cuchito server to listen to.

#### Start a a manual session

```
npm start
```

Manual sessions proxies the API.

Eventhough the requests and responses can be multiplied, mutated, validated, tested, logged, and re-routed, cuchito works transparentely so any client should will as expected.

You just need to connect the client to the ip and port that you has been set in `./cuchito.js`.

#### Run a saved session

```
npm test
```

Replay a sessions to send the saved requests to the host, in mostly the same fashion (multiplying, mutating, validating, testing, loging, and/or rerouting).

There are two differences:

* Requests are not validated nor tested, only responses.
* If any response validation or test fails, the reproduction stops with an error.

### Basic manual Stress Test

Edit the file `./cuchito.js`

* config the request multiplication:
  * add the methods don't you want to multiply to the `skipMethod` object, as truthy.
  * `count` sets the amount of times each incoming request will be sent to the host
  * `interval` sets the waiting milliseconds between those extra request

```
...
  multiply: {
    count: 50,
    interval: 500,
    skipMethods: {
      'POST': 1,
      'PUT': 1,
      'DELETE': 1
    },
  },
...
```

This example configures cuchito to resend any request 50 times, in intervals of 500 milliseconds, skipping those whose method are POST, PUT or DELETE.


### Basic automated stress tests

Unless you have changed the record configuration, every manual stress test you have done has been recorded.

These recorded sessions can be replayed with the following command:

```
npm test
```

new saved session does not replace or overwrite the current save session, but merge into it.

Please be aware that all recorded sessions would be reproduced simultaneously.


### Basic forensics

cuchito dumps log files with the whole request and response, for each not cloned requests.

This logs are stored in both modes, manual an automated.

The file name is a csv row, with the next: timestamp, method, path, status, test result. For instance: `./logs/1592566705414,GET,⁄foo⁄bar?baz=qux,200,ok.yml`

The file is a `yml` with the fields `request`, `response`, and optionally `originalRequest`, `originalResponse`, `error` and `logs`

```
request:
  path: /foo/bar?baz=qux
  params:
    fooId: bar
  query:
    baz: qux
  headers:
    content-type: application/json
  method: GET
  body: {}
response:
  headers:
    content-type: application/json; charset=utf-8
  status: 200
  body:
    result: ok
    code: 200
```

We will learn about the optional fields in the sections about mutations, advanced tests, and advanced logs.

### Request schema validation

When you are running a manual session (and only in manual sessions), you can validate the incoming requests.

In the folder `./endpoints` create a `test.js` file in a path that mimics the endpoint's route and method you want to test. For instance `./endpoints/foo/bar/POST/test.js`

You can also set up dinamic urls, wrapping the parameter name with brackets, like `./endpoints/foo/[fooId]/PUT/test.js`

To validate the schema of the request this file needs to export a [@hapi/joi object](https://github.com/hapijs/joi#readme) as `requestSchema`

```
const joi = require('@hapi/joi');

exports.requestSchema = joi.object({
  headers: joi.object(
    'content-type': joi.valid('application/json'),
  ),
  body: ...
  params: ...,
  query: ...,
})
```

If the request's body is json and the content type is application/json, `body` will be a javascript object. Otherwise it will be a string.

`params` is an object with the route params. So if the file is `./endpoints/foo/[fooId]/PUT/test.js` and the request is `PUT /foo/bar` params will be `{ foodId: 'bar' }`

`query` is an object with the query params So if thethe request is `PUT /foo/bar?baz=qux` query will be `{ baz: 'qux' }`

No coercion is done, the values in `params` and `query` are always strings.

The validation errors will show up red in the console. The session will not stop, and the request is not skiped. It will reach the host.

On top of that, the logs and recordings of the requests whose validation has failed will have the extension `.error.yml` instead of `.ok.yml`

### Response schema validation

The response schema validation works much like the request schema validation.

The differences are:

* The `@hapi/joi` validations must be exported as `responseSchema`, and obviously the same `.../test.js` can export request validations and respons evalidations.

* The response schema validation runs on both modes, manual and automated.

* Automated sessions stop when any response schema validation fails.


```
const joi = require('@hapi/joi');

exports.responseSchema = joi.object({
  status: joi.valid(200),
  headers: ...,
  body: ...,
})
```
If the body is json and the content type is application/json, `body` will be a javascript object. Otherwise it will be a string.


## advanced guides

### configuration

The main config file is `./cuchito.js`

This javascript is executed, in can includes any logic you need to create dinamic configurations.

Just export a javascript object with all the configuration you need.

* `host`: Host to reverse-proxy the request to
* `ip`: Ip to listen to
* `port`: port to listen to
* `maxTimeSpan`: Send an error to the client when the request takes more than `maxTimeSpan` milliseconds. 0 or falsy to disable the feature and wait forever.

If your configuration depends on some asynchronous source, or it could changes on run time you have to include a `oChange` function that accept a handler, that you can call with the actualized configuration as many times as you want.

You can disable the logging by removing the field `logs` in the file `cuchito.js` or by renaming it to `logs_` for instance.

You can configure the logs independently for each endpoint or endpoint groups, by creating a `conf.js` in the `endpoints` folder in a path that mimics the endpoints' route you want to configure.

The fields of the `./endpoints/foo/[fooId]/GET/conf.js` overwrite the fields of the `cuchito.js` file.

#### skip-all log-some strategy.

You can disable all the logs in `./cuchito.js` and enable it for some endpoint in `./endpoints/some/endpoint/GET/conf.js`

#### log-all skip-some strategy

You can disable all the logs in `./cuchito.js` and enable it for some endpoint in `./endpoints/some/endpoint/GET/conf.js`


### Mutate requests

### Mutate responses

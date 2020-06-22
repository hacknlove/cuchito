# cuchito
fantasic api testing tool

## Feature index

* **Guided stress test**
  * Connect your front to cuchito and let it multiply your API calls thousands of time
* **Automated stress test**
  * Save your guided stress tests to create automated stress test that you can launch unatended.
* **API testing**
  * Add tests to check the responses of the requests made for the saved session
* **API mocking**
  * Replace or mutate request and responses, to test new features or edge cases on the front or the back.
* **re-routing**
  * Redirect some endpoints to other hosts and paths
* **Real time config reload**
  * Change any configuration global or endpoint specific on the fly.

## Quick guides

### Basic manual Stress Test

#### Initialize a cuchito project
```
npm init cuchito foo
cd foo
```

#### Edit the file called `cuchito.js` to:

* set the field `host` to point to the API you want to stress.
* set the IP and port you want your cuchito server to listen to.
* select which methods do you want to multiply
* config the request multiplication:
  * `count` sets the amount of times each incoming request will be sent to the host
  * `interval` sets the waiting miliseconds between those extra request

#### Start cuchito

```
npm start
```

#### Connect your front

You need to setup your front to use the ip and port specified in `./cuchito.js`. You could also use ngrok.

You can use use the webapp/mobile-app for which the API has been developed. You can use ngrok to make it easy.

You also can use any other testing tool like postman or curl to send some edge case requests of scenarios that are difficult to reach with the actual app. 

#### Use your front as usual

You only need to use the front as usual, to have all the requests multiplied as times as you needed to.

### Basic automated stress tests

Unless you have changed the record configuration, every manual stress test you have done has been recorded.

These recorded sessions can be replayed with the following command:

```
npm test
```

be aware that all recorded sessions would be reproduced simultaneously.

### Basic front side API testing

When you are running a manual session, you can set test to validate the incoming requests.

In the folder `./endpoints` create a `test.js` file that mimics the path and method of the endpoint you want to test. For instance `./endpoints/foo/bar/POST/test.js`

You can also set updinamic urls, wrapping the parameter name with brackets, like `./endpoints/foo/[fooId]/PUT/test.js`

You can validate the schema of the request exporting a [@hapi/joi object](https://github.com/hapijs/joi#readme)

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

If the body is json and the content type is application/json, `body` will be a javascript object. Otherwise it will be a string.

The errors will show up red in the console, in the `./logs` and/or `./saved` folders as as `./logs|saved/{filename}.error.yml` if the logs and/or recorder are enabled. 

> but wait, why would I ever want to do this? is not the incoming data validation something that should care to the backend?

I can think of many scenarios where this feature could be usefull:

1. You are a frontend developer using a third party API whose error messages are too litle informative, and you want to be sure you are using it right.
2. You are a QA narrowing down the cases on which the app send some wrong request, so instead of messing around with the frontend code or the backend code, you just run cuchito with a couple of request validations.


### Basic forensics

cuchito can write to the disk log files for all the requests you send to it and responses you receive from it.

It does not write logs for the extra requests that it sends to stress the API.

Take a look at [config](#config) to learn how to configure the logs.

### Basic API testing

API testing set up is pretti similar to the front side API testing.

You just need to add `@hapi/joi` validations in each `./endpoints/foo/bar/[barId]/POST/test.js` you want to test.

```
const joi = require('@hapi/joi');

exports.requestSchema = joi.object({
  status: joi.valid(200),
  headers: ...,
  body: ...,
})
```
If the body is json and the content type is application/json, `body` will be a javascript object. Otherwise it will be a string.

The first difference is that API testing runs also when the session is reproduced, unlike the front-end API testing that only runs in live sessions.

The second difference is that the reproduction stops when any API test fails, whereas the front-end API testing never stops the session, no matter whether some request fails or not.

## advanced guides

### configuration



You can disable the logging by removing the field `logs` in the file `cuchito.js` or by renaming it to `logs_` for instance.

You can configure the logs independently for each endpoint or endpoint groups, by creating a `conf.js` in the `endpoints` folder in a path that mimics the endpoints' route you want to configure.

The fields of the `./endpoints/foo/[fooId]/GET/conf.js` overwrite the fields of the `cuchito.js` file.

#### skip-all log-some strategy.

You can disable all the logs in `./cuchito.js` and enable it for some endpoint in `./endpoints/some/endpoing/GET/conf.js`

#### log-all skip-some strategy

You can disable all the logs in `./cuchito.js` and enable it for some endpoint in `./endpoints/some/endpoing/GET/conf.js`


### Mutate requests

### Mutate responses

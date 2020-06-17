# cuchito
ultimate api testing tool

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

## Quick start

### Stand alone project

```
npm init cuchito
```

Edit the files config, and create some specific configuration for any endpoint you want to, and then save your first session with

```
npm start
```

replay your session with the following command
```
npm run play
```

You record more requests to the session with. From the start.
```
npm start
```

To remove the session run
```
npm run clear
```

Replay the session with
```
npm test
```

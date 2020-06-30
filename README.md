Local test server
=================

This is a quick server library that exposes one async, `start` to control a local static file server. You can only control the path that is server. The port is assigned for you and this always binds to 127.0.0.1.

## Who is this for?

People who want to test interaction with an HTTP server and want to control that dependency locally so tests don't have to reach out to the internet.

## Usage


```js
const {start} = require('@jsoverson/test-server');
const fetch = require('node-fetch');

(async function(){
  const server = await start();

  console.log(`Server started on port ${server.port}, serving directory ${server.path}.`);

  const response = await fetch(server.url('index.html'));

  await server.stop();
}())
```

## Debugging

This library uses `debug` so you can start your script with `DEBUG=test-server* yourScript.js` to get debug output.

## API

### `start(...pathParts = [process.cwd(), 'server_root'])` returns `TestServer`

`pathParts` are the parts of the path that can be passed to `path.join()`. Defaults to a 'server_root' directory in the current working directory.

### TestServer();

#### .port

The assigned port

#### .path

The path that is being served

#### .address

The http path + port.

#### .url(path) 

Convenience method that appends `path` to `.address`
